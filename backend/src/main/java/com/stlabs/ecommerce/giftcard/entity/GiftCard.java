
package com.stlabs.ecommerce.giftcard.entity;

import com.stlabs.ecommerce.common.entity.BaseEntity;
import com.stlabs.ecommerce.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "gift_cards",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_gift_card_code",
        columnNames = "code"
    )
)
@Getter
@Setter
@NoArgsConstructor
public class GiftCard extends BaseEntity {

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal initialAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balance;

    @Column(nullable = false)
    private boolean active = true;

    private LocalDate expiryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
