package com.stlabs.ecommerce.returnrequest.controller;

import com.stlabs.ecommerce.returnrequest.dto.CreateReturnRequest;
import com.stlabs.ecommerce.returnrequest.dto.ReturnDecisionRequest;
import com.stlabs.ecommerce.returnrequest.dto.ReturnRequestResponse;
import com.stlabs.ecommerce.returnrequest.service.ReturnRequestService;
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

@RestController
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReturnRequestResponse createReturnRequest(
            @Valid @RequestBody CreateReturnRequest request) {

        return returnRequestService.createReturnRequest(request);
    }

    @GetMapping
    public List<ReturnRequestResponse> getMyReturnRequests() {

        return returnRequestService.getMyReturnRequests();
    }

    @GetMapping("/admin")
    public List<ReturnRequestResponse> getAllReturnRequests() {

        return returnRequestService.getAllReturnRequests();
    }

    @PatchMapping("/admin/{id}/decision")
    public ReturnRequestResponse decideReturnRequest(
            @PathVariable Long id,
            @Valid @RequestBody ReturnDecisionRequest request) {

        return returnRequestService.decideReturnRequest(id, request);
    }
}