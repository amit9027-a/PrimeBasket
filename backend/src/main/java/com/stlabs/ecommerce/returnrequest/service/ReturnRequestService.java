package com.stlabs.ecommerce.returnrequest.service;

import com.stlabs.ecommerce.returnrequest.dto.CreateReturnRequest;
import com.stlabs.ecommerce.returnrequest.dto.ReturnDecisionRequest;
import com.stlabs.ecommerce.returnrequest.dto.ReturnRequestResponse;
import java.util.List;

public interface ReturnRequestService {

    ReturnRequestResponse createReturnRequest(CreateReturnRequest request);

    List<ReturnRequestResponse> getMyReturnRequests();

    List<ReturnRequestResponse> getAllReturnRequests();

    ReturnRequestResponse decideReturnRequest(
            Long id,
            ReturnDecisionRequest request
    );
}