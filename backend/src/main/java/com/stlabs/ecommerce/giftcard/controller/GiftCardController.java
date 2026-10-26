
package com.stlabs.ecommerce.giftcard.controller;

import com.stlabs.ecommerce.giftcard.dto.CreateGiftCardRequest;
import com.stlabs.ecommerce.giftcard.dto.GiftCardQuoteRequest;
import com.stlabs.ecommerce.giftcard.dto.GiftCardQuoteResponse;
import com.stlabs.ecommerce.giftcard.dto.GiftCardRedemptionResponse;
import com.stlabs.ecommerce.giftcard.dto.GiftCardResponse;
import com.stlabs.ecommerce.giftcard.dto.GiftCardStatusRequest;
import com.stlabs.ecommerce.giftcard.service.GiftCardService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/gift-cards")
@RequiredArgsConstructor
@Validated
public class GiftCardController {

    private final GiftCardService giftCardService;

    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    public GiftCardResponse create(
            @Valid @RequestBody CreateGiftCardRequest request) {
        return giftCardService.create(request);
    }

    @GetMapping("/admin")
    public List<GiftCardResponse> getAll() {
        return giftCardService.getAll();
    }

    @PatchMapping("/admin/{id}/status")
    public GiftCardResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody GiftCardStatusRequest request) {
        return giftCardService.updateStatus(id, request);
    }

    @GetMapping("/balance")
    public GiftCardResponse checkBalance(@RequestParam String code) {
        return giftCardService.checkBalance(code);
    }

    @GetMapping("/history")
    public List<GiftCardRedemptionResponse> getMyRedemptions() {
        return giftCardService.getMyRedemptions();
    }

    @PostMapping("/quote")
    public GiftCardQuoteResponse quote(
            @Valid @RequestBody GiftCardQuoteRequest request) {
        return giftCardService.quote(request);
    }
}
