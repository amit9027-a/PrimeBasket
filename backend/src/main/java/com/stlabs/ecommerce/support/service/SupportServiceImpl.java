package com.stlabs.ecommerce.support.service;

import com.stlabs.ecommerce.common.security.CurrentUserService;
import com.stlabs.ecommerce.auth.security.SecurityConstants;
import com.stlabs.ecommerce.exception.ResourceNotFoundException;
import com.stlabs.ecommerce.support.dto.CreateSupportConversationRequest;
import com.stlabs.ecommerce.support.dto.SendSupportMessageRequest;
import com.stlabs.ecommerce.support.dto.SupportConversationResponse;
import com.stlabs.ecommerce.support.dto.SupportMessageResponse;
import com.stlabs.ecommerce.support.dto.UpdateSupportStatusRequest;
import com.stlabs.ecommerce.support.entity.SupportConversation;
import com.stlabs.ecommerce.support.entity.SupportMessage;
import com.stlabs.ecommerce.support.entity.SupportStatus;
import com.stlabs.ecommerce.support.repository.SupportConversationRepository;
import com.stlabs.ecommerce.support.repository.SupportMessageRepository;
import com.stlabs.ecommerce.user.entity.User;
import java.util.List;
import java.util.Objects;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SupportServiceImpl implements SupportService {

    private final SupportConversationRepository conversationRepository;
    private final SupportMessageRepository messageRepository;
    private final CurrentUserService currentUserService;

    public SupportServiceImpl(
            SupportConversationRepository conversationRepository,
            SupportMessageRepository messageRepository,
            CurrentUserService currentUserService
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.currentUserService = currentUserService;
    }

    @Override
    public SupportConversationResponse createConversation(
            CreateSupportConversationRequest request
    ) {
        User customer = currentUserService.getCurrentUser();

        SupportConversation conversation = new SupportConversation();
        conversation.setSubject(request.subject().trim());
        conversation.setCustomer(customer);
        conversation.setStatus(SupportStatus.OPEN);

        conversation = conversationRepository.save(conversation);

        saveMessage(conversation, customer, request.message());

        return buildResponse(conversation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportConversationResponse> getMyConversations() {
        User currentUser = currentUserService.getCurrentUser();

        return conversationRepository
                .findByCustomerIdOrderByUpdatedAtDesc(currentUser.getId())
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportConversationResponse> getAllConversations() {
        requireAdmin();

        return conversationRepository
                .findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SupportConversationResponse getConversation(Long conversationId) {
        SupportConversation conversation =
                findAuthorizedConversation(conversationId);

        return buildResponse(conversation);
    }

    @Override
    public SupportConversationResponse sendMessage(
            Long conversationId,
            SendSupportMessageRequest request
    ) {
        User sender = currentUserService.getCurrentUser();

        SupportConversation conversation =
                findAuthorizedConversation(conversationId);

        if (conversation.getStatus() == SupportStatus.RESOLVED) {
            throw new IllegalStateException(
                    "Cannot send a message to a resolved conversation."
            );
        }

        saveMessage(conversation, sender, request.message());

        if (isAdmin(sender)) {
            conversation.setStatus(SupportStatus.IN_PROGRESS);
        }

        conversationRepository.save(conversation);

        return buildResponse(conversation);
    }

    @Override
    public SupportConversationResponse updateStatus(
            Long conversationId,
            UpdateSupportStatusRequest request
    ) {
        requireAdmin();

        SupportConversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Support conversation not found: " + conversationId
                ));

        conversation.setStatus(request.status());
        conversationRepository.save(conversation);

        return buildResponse(conversation);
    }

    @Override
    public SupportConversationResponse markConversationRead(
            Long conversationId
    ) {
        SupportConversation conversation =
                findAuthorizedConversation(conversationId);

        String adminRole = SecurityConstants.ROLE_ADMIN;

        if (currentUserService.isAdmin()) {
            messageRepository.markMessagesReadByAdmin(
                    conversationId,
                    adminRole
            );
        } else {
            messageRepository.markMessagesReadByCustomer(
                    conversationId,
                    adminRole
            );
        }

        return buildResponse(conversation);
    }

    private SupportConversation findAuthorizedConversation(Long conversationId) {
        User currentUser = currentUserService.getCurrentUser();

        if (currentUserService.isAdmin()) {
            return conversationRepository
                    .findById(conversationId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Support conversation not found: " + conversationId
                    ));
        }

        return conversationRepository
                .findByIdAndCustomerId(conversationId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Support conversation not found: " + conversationId
                ));
    }

    private void saveMessage(
            SupportConversation conversation,
            User sender,
            String messageText
    ) {
        SupportMessage message = new SupportMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setMessage(messageText.trim());

        // Both read flags default to false.
        // The recipient's read flag is updated when the conversation is opened.
        messageRepository.save(message);
    }

    private SupportConversationResponse buildResponse(
            SupportConversation conversation
    ) {
        List<SupportMessageResponse> messages = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversation.getId())
                .stream()
                .map(SupportMessageResponse::from)
                .toList();

        long unreadCount;

        if (currentUserService.isAdmin()) {
            unreadCount = messageRepository.countUnreadByAdmin(
                    conversation.getId(),
                    SecurityConstants.ROLE_ADMIN
            );
        } else {
            unreadCount = messageRepository.countUnreadByCustomer(
                    conversation.getId(),
                    SecurityConstants.ROLE_ADMIN
            );
        }

        return SupportConversationResponse.from(
                conversation,
                messages,
                unreadCount
        );
    }

    private void requireAdmin() {
        if (!currentUserService.isAdmin()) {
            throw new AccessDeniedException(
                    "Only administrators can perform this action."
            );
        }
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null
                && Objects.equals(
                        user.getRole().getName(),
                        SecurityConstants.ROLE_ADMIN
                );
    }
}