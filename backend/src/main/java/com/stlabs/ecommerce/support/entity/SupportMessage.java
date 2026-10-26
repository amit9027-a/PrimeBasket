package com.stlabs.ecommerce.support.entity;

import com.stlabs.ecommerce.common.entity.BaseEntity;
import com.stlabs.ecommerce.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "support_messages")
@Getter
@Setter
@NoArgsConstructor
public class SupportMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private SupportConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, length = 3000)
    private String message;

    @Column(name = "read_by_admin", nullable = false,
            columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean readByAdmin = false;

    @Column(name = "read_by_customer", nullable = false,
            columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean readByCustomer = false;
}