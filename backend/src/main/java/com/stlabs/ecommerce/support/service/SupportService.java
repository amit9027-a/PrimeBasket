package com.stlabs.ecommerce.support.service;

import com.stlabs.ecommerce.support.dto.CreateSupportConversationRequest;
import com.stlabs.ecommerce.support.dto.SendSupportMessageRequest;
import com.stlabs.ecommerce.support.dto.SupportConversationResponse;
import com.stlabs.ecommerce.support.dto.UpdateSupportStatusRequest;
import java.util.List;

public interface SupportService {

    SupportConversationResponse createConversation(
            CreateSupportConversationRequest request
    );

    List<SupportConversationResponse> getMyConversations();

    List<SupportConversationResponse> getAllConversations();

    SupportConversationResponse getConversation(Long conversationId);

    SupportConversationResponse sendMessage(
            Long conversationId,
            SendSupportMessageRequest request
    );

    SupportConversationResponse updateStatus(
            Long conversationId,
            UpdateSupportStatusRequest request
    );

    SupportConversationResponse markConversationRead(Long conversationId);
}