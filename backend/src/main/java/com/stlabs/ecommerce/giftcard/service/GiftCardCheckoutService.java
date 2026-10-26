package com.stlabs.ecommerce.giftcard.service;

import com.stlabs.ecommerce.common.security.CurrentUserService;
import com.stlabs.ecommerce.giftcard.entity.GiftCard;
import com.stlabs.ecommerce.giftcard.entity.GiftCardRedemption;
import com.stlabs.ecommerce.giftcard.repository.GiftCardRedemptionRepository;
import com.stlabs.ecommerce.giftcard.repository.GiftCardRepository;
import com.stlabs.ecommerce.order.entity.Order;
import com.stlabs.ecommerce.user.entity.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GiftCardCheckoutService {

    private final GiftCardRepository giftCardRepository;
    private final GiftCardRedemptionRepository redemptionRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public BigDecimal calculateDiscount(
            String rawCode,
            BigDecimal cartTotal) {

        BigDecimal total = normalize(cartTotal);

        if (rawCode == null || rawCode.isBlank()) {
            return BigDecimal.ZERO.setScale(2);
        }

        GiftCard card = giftCardRepository
                .findByCodeIgnoreCase(rawCode.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid Gift Card code"));

        validateUsable(card);

        BigDecimal balance = normalize(card.getBalance());

        return balance.min(total)
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public void redeem(
            String rawCode,
            BigDecimal cartTotal,
            BigDecimal expectedDiscount,
            Order order) {

        if (rawCode == null || rawCode.isBlank()) {
            return;
        }

        if (order == null || order.getId() == null) {
            throw new IllegalArgumentException(
                    "Order must be saved before redeeming a Gift Card");
        }

        GiftCard card = giftCardRepository
                .findByCodeForUpdate(rawCode.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid Gift Card code"));

        validateUsable(card);

        BigDecimal total = normalize(cartTotal);
        BigDecimal balance = normalize(card.getBalance());
        BigDecimal actualDiscount = balance.min(total)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal requiredDiscount = normalize(expectedDiscount);

        if (actualDiscount.compareTo(requiredDiscount) != 0) {
            throw new IllegalArgumentException(
                    "Gift Card balance changed during checkout. "
                            + "Please refresh the cart and try again.");
        }

        if (actualDiscount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Gift Card has no usable balance");
        }

        card.setBalance(
                balance.subtract(actualDiscount)
                        .setScale(2, RoundingMode.HALF_UP));

        giftCardRepository.save(card);

        User user = currentUserService.getCurrentUser();

        GiftCardRedemption redemption = new GiftCardRedemption();
        redemption.setGiftCard(card);
        redemption.setUser(user);
        redemption.setOrder(order);
        redemption.setAmount(actualDiscount);

        redemptionRepository.save(redemption);
    }

    private void validateUsable(GiftCard card) {
        if (!card.isActive()) {
            throw new IllegalArgumentException(
                    "This Gift Card is inactive");
        }

        if (card.getExpiryDate() != null
                && card.getExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "This Gift Card has expired");
        }

        if (card.getBalance() == null
                || card.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "This Gift Card has no remaining balance");
        }
    }

    private BigDecimal normalize(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO.setScale(2);
        }

        return amount.setScale(2, RoundingMode.HALF_UP);
    }
}