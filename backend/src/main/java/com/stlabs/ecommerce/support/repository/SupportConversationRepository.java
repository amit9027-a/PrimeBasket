package com.stlabs.ecommerce.support.repository;

import com.stlabs.ecommerce.support.entity.SupportConversation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportConversationRepository
        extends JpaRepository<SupportConversation, Long> {

    List<SupportConversation> findByCustomerIdOrderByUpdatedAtDesc(Long customerId);

    List<SupportConversation> findAllByOrderByUpdatedAtDesc();

    Optional<SupportConversation> findByIdAndCustomerId(
            Long id,
            Long customerId
    );
}