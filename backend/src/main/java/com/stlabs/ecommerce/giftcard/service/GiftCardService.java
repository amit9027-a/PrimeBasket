
package com.stlabs.ecommerce.giftcard.service;

import com.stlabs.ecommerce.common.security.CurrentUserService;
import com.stlabs.ecommerce.giftcard.dto.CreateGiftCardRequest;
import com.stlabs.ecommerce.giftcard.dto.GiftCardQuoteRequest;
import com.stlabs.ecommerce.giftcard.dto.GiftCardQuoteResponse;
import com.stlabs.ecommerce.giftcard.dto.GiftCardRedemptionResponse;
import com.stlabs.ecommerce.giftcard.dto.GiftCardResponse;
import com.stlabs.ecommerce.giftcard.dto.GiftCardStatusRequest;
import com.stlabs.ecommerce.giftcard.entity.GiftCard;
import com.stlabs.ecommerce.giftcard.repository.GiftCardRedemptionRepository;
import com.stlabs.ecommerce.giftcard.repository.GiftCardRepository;
import com.stlabs.ecommerce.order.service.OrderService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GiftCardService {

    private final GiftCardRepository giftCardRepository;
    private final GiftCardRedemptionRepository redemptionRepository;
    private final CurrentUserService currentUserService;
    private final OrderService orderService;

    public GiftCardService(
            GiftCardRepository giftCardRepository,
            GiftCardRedemptionRepository redemptionRepository,
            CurrentUserService currentUserService,
            OrderService orderService) {
        this.giftCardRepository = giftCardRepository;
        this.redemptionRepository = redemptionRepository;
        this.currentUserService = currentUserService;
        this.orderService = orderService;
    }

    @Transactional
    public GiftCardResponse create(CreateGiftCardRequest request) {
        if (request.amount() == null
                || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Gift Card amount must be greater than zero");
        }

        GiftCard card = new GiftCard();
        card.setCode(generateUniqueCode());
        card.setInitialAmount(request.amount());
        card.setBalance(request.amount());
        card.setActive(true);
        card.setExpiryDate(request.expiryDate());
        card.setCreatedBy(currentUserService.getCurrentUser());

        return GiftCardResponse.from(
                giftCardRepository.saveAndFlush(card));
    }

    @Transactional
    public List<GiftCardResponse> getAll() {
        return giftCardRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(GiftCardResponse::from)
                .toList();
    }

    @Transactional
    public GiftCardResponse updateStatus(
            Long id, GiftCardStatusRequest request) {
        GiftCard card = giftCardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Gift Card not found"));

        card.setActive(request.active());
        return GiftCardResponse.from(giftCardRepository.save(card));
    }

    @Transactional
    public GiftCardResponse checkBalance(String rawCode) {
        GiftCard card = findUsableCard(rawCode);
        return GiftCardResponse.from(card);
    }

    @Transactional
    public GiftCardQuoteResponse quote(GiftCardQuoteRequest request) {
        GiftCard card = findUsableCard(request.code());

        BigDecimal cartTotal = BigDecimal.valueOf(
                orderService.getCurrentCartTotal())
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal availableBalance = card.getBalance()
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal discount = availableBalance.min(cartTotal)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal payableAmount = cartTotal.subtract(discount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        return new GiftCardQuoteResponse(
                card.getCode(),
                cartTotal,
                availableBalance,
                discount,
                payableAmount);
    }

    @Transactional
    public List<GiftCardRedemptionResponse> getMyRedemptions() {
        Long userId = currentUserService.getCurrentUser().getId();

        return redemptionRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(GiftCardRedemptionResponse::from)
                .toList();
    }

    private GiftCard findUsableCard(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            throw new IllegalArgumentException(
                    "Gift Card code is required");
        }

        GiftCard card = giftCardRepository
                .findByCodeIgnoreCase(rawCode.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Invalid Gift Card code"));

        validateUsable(card);
        return card;
    }

    private void validateUsable(GiftCard card) {
        if (!card.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This Gift Card is inactive");
        }

        if (card.getExpiryDate() != null
                && card.getExpiryDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This Gift Card has expired");
        }

        if (card.getBalance() == null
                || card.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This Gift Card has no remaining balance");
        }
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 5; attempt++) {
            String code = "PRIMEBASKET-"
                    + UUID.randomUUID().toString()
                    .replace("-", "")
                    .substring(0, 16)
                    .toUpperCase();

            if (!giftCardRepository.existsByCode(code)) {
                return code;
            }
        }

        throw new IllegalStateException(
                "Could not generate a unique Gift Card code. Please retry.");
    }
}
