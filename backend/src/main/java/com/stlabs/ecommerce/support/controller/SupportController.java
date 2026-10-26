package com.stlabs.ecommerce.support.controller;

import com.stlabs.ecommerce.support.dto.CreateSupportConversationRequest;
import com.stlabs.ecommerce.support.dto.SendSupportMessageRequest;
import com.stlabs.ecommerce.support.dto.SupportConversationResponse;
import com.stlabs.ecommerce.support.dto.UpdateSupportStatusRequest;
import com.stlabs.ecommerce.support.service.SupportService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
@Tag(
        name = "Customer Support",
        description = "Customer support conversations and messages"
)
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/conversations")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a support conversation")
    public SupportConversationResponse createConversation(
            @Valid @RequestBody CreateSupportConversationRequest request
    ) {
        return supportService.createConversation(request);
    }

    @GetMapping("/conversations")
    @Operation(summary = "Get current customer's conversations")
    public List<SupportConversationResponse> getMyConversations() {
        return supportService.getMyConversations();
    }

    @GetMapping("/conversations/{id}")
    @Operation(summary = "Get a support conversation")
    public SupportConversationResponse getConversation(
            @PathVariable Long id
    ) {
        return supportService.getConversation(id);
    }

    @PostMapping("/conversations/{id}/messages")
    @Operation(summary = "Send a message to a support conversation")
    public SupportConversationResponse sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody SendSupportMessageRequest request
    ) {
        return supportService.sendMessage(id, request);
    }

    @GetMapping("/admin/conversations")
    @Operation(
            summary = "Get all support conversations",
            description = "Admin only"
    )
    public List<SupportConversationResponse> getAllConversations() {
        return supportService.getAllConversations();
    }

    @PatchMapping("/admin/conversations/{id}/status")
    @Operation(
            summary = "Update support conversation status",
            description = "Admin only"
    )
    public SupportConversationResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSupportStatusRequest request
    ) {
        return supportService.updateStatus(id, request);
    }

    @PatchMapping("/conversations/{id}/read")
    @Operation(summary = "Mark messages in a conversation as read")
    public SupportConversationResponse markConversationRead(
            @PathVariable Long id
    ) {
        return supportService.markConversationRead(id);
    }
}