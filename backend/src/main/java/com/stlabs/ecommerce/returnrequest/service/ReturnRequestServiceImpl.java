package com.stlabs.ecommerce.returnrequest.service;

import com.stlabs.ecommerce.common.security.CurrentUserService;
import com.stlabs.ecommerce.order.entity.Order;
import com.stlabs.ecommerce.order.entity.OrderStatus;
import com.stlabs.ecommerce.order.repository.OrderRepository;
import com.stlabs.ecommerce.returnrequest.dto.CreateReturnRequest;
import com.stlabs.ecommerce.returnrequest.dto.ReturnDecisionRequest;
import com.stlabs.ecommerce.returnrequest.dto.ReturnRequestResponse;
import com.stlabs.ecommerce.returnrequest.entity.RefundStatus;
import com.stlabs.ecommerce.returnrequest.entity.ReturnRequest;
import com.stlabs.ecommerce.returnrequest.entity.ReturnStatus;
import com.stlabs.ecommerce.returnrequest.repository.ReturnRequestRepository;
import com.stlabs.ecommerce.user.entity.User;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReturnRequestServiceImpl implements ReturnRequestService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final CurrentUserService currentUserService;

    @Override
    public ReturnRequestResponse createReturnRequest(
            CreateReturnRequest request) {

        User currentUser = currentUserService.getCurrentUser();

        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException(
                    "You cannot request a return for another customer's order");
        }

        if (order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new IllegalArgumentException(
                    "Only delivered orders are eligible for return");
        }

        if (returnRequestRepository.existsByOrderId(order.getId())) {
            throw new IllegalArgumentException(
                    "A return request already exists for this order");
        }

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrder(order);
        returnRequest.setUser(currentUser);
        returnRequest.setReason(request.reason().trim());
        returnRequest.setDescription(normalizeDescription(
                request.description()));
        returnRequest.setStatus(ReturnStatus.PENDING);
        returnRequest.setRefundStatus(RefundStatus.NOT_REQUIRED);

        ReturnRequest saved =
                returnRequestRepository.save(returnRequest);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestResponse> getMyReturnRequests() {

        User currentUser = currentUserService.getCurrentUser();

        return returnRequestRepository
                .findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestResponse> getAllReturnRequests() {

        requireAdmin();

        return returnRequestRepository.findAll()
                .stream()
                .sorted((first, second) ->
                        second.getCreatedAt().compareTo(first.getCreatedAt()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ReturnRequestResponse decideReturnRequest(
            Long id,
            ReturnDecisionRequest request) {

        requireAdmin();

        ReturnRequest returnRequest = returnRequestRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Return request not found"));

        if (returnRequest.getStatus() != ReturnStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only pending return requests can be approved or rejected");
        }

        String decision = request.decision()
                .trim()
                .toUpperCase(Locale.ROOT);

        switch (decision) {
            case "APPROVE" -> {
                returnRequest.setStatus(ReturnStatus.APPROVED);

                // Approval does not mean that a refund has been paid.
                // Actual refund processing must be handled separately.
                returnRequest.setRefundStatus(
                        RefundStatus.MANUAL_REQUIRED);
            }

            case "REJECT" -> {
                returnRequest.setStatus(ReturnStatus.REJECTED);
                returnRequest.setRefundStatus(
                        RefundStatus.NOT_REQUIRED);
            }

            default -> throw new IllegalArgumentException(
                    "Decision must be APPROVE or REJECT");
        }

        returnRequest.setAdminNote(
                normalizeDescription(request.adminNote()));

        ReturnRequest saved =
                returnRequestRepository.save(returnRequest);

        return toResponse(saved);
    }

    private void requireAdmin() {
        if (!currentUserService.isAdmin()) {
            throw new IllegalArgumentException(
                    "Only administrators can perform this action");
        }
    }

    private String normalizeDescription(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private ReturnRequestResponse toResponse(
            ReturnRequest returnRequest) {

        Order order = returnRequest.getOrder();
        User user = returnRequest.getUser();

        return new ReturnRequestResponse(
                returnRequest.getId(),
                order.getId(),
                user.getId(),
                user.getEmail(),
                order.getTotalAmount(),
                returnRequest.getReason(),
                returnRequest.getDescription(),
                returnRequest.getStatus(),
                returnRequest.getRefundStatus(),
                returnRequest.getAdminNote(),
                returnRequest.getCreatedAt()
        );
    }
}