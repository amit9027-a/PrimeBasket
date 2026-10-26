package com.stlabs.ecommerce.returnrequest.repository;

import com.stlabs.ecommerce.returnrequest.entity.ReturnRequest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReturnRequestRepository
        extends JpaRepository<ReturnRequest, Long> {

    List<ReturnRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ReturnRequest> findByOrderId(Long orderId);

    boolean existsByOrderId(Long orderId);
}