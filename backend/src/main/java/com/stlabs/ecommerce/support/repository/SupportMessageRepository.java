package com.stlabs.ecommerce.support.repository;

import com.stlabs.ecommerce.support.entity.SupportMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupportMessageRepository
        extends JpaRepository<SupportMessage, Long> {

    List<SupportMessage> findByConversationIdOrderByCreatedAtAsc(
            Long conversationId
    );

    @Query("""
        SELECT COUNT(m)
        FROM SupportMessage m
        WHERE m.conversation.id = :conversationId
          AND m.readByAdmin = false
          AND m.sender.role.name <> :adminRole
        """)
    long countUnreadByAdmin(
            @Param("conversationId") Long conversationId,
            @Param("adminRole") String adminRole
    );

    @Query("""
        SELECT COUNT(m)
        FROM SupportMessage m
        WHERE m.conversation.id = :conversationId
          AND m.readByCustomer = false
          AND m.sender.role.name = :adminRole
        """)
    long countUnreadByCustomer(
            @Param("conversationId") Long conversationId,
            @Param("adminRole") String adminRole
    );

    @Modifying
    @Query("""
        UPDATE SupportMessage m
        SET m.readByAdmin = true
        WHERE m.conversation.id = :conversationId
          AND m.sender.role.name <> :adminRole
        """)
    int markMessagesReadByAdmin(
            @Param("conversationId") Long conversationId,
            @Param("adminRole") String adminRole
    );

    @Modifying
    @Query("""
        UPDATE SupportMessage m
        SET m.readByCustomer = true
        WHERE m.conversation.id = :conversationId
          AND m.sender.role.name = :adminRole
        """)
    int markMessagesReadByCustomer(
            @Param("conversationId") Long conversationId,
            @Param("adminRole") String adminRole
    );
}