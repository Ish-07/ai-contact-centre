import re
from typing import Dict, Any, List

class PIIService:
    """Enterprise PII Detection and Masking Service.
    Combines strict regex guards with structured redactions."""

    EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    PHONE_REGEX = r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
    CARD_REGEX = r'\b(?:\d{4}[-\s]?){3}\d{4}\b'
    SSN_REGEX = r'\b\d{3}-\d{2}-\d{4}\b'
    ACCOUNT_REGEX = r'\b(?:ACCT|ACC|ACT|NO)[-:\s]?([0-9]{8,12})\b'

    def scan_and_mask(self, text: str) -> Dict[str, Any]:
        if not text:
            return {
                "original_text": "",
                "masked_text": "",
                "entities_count": 0,
                "detections": []
            }

        detections = []
        masked = text

        # 1. Credit Cards
        for match in re.finditer(self.CARD_REGEX, text):
            raw = match.group(0)
            digits = re.sub(r'\D', '', raw)
            last4 = digits[-4:] if len(digits) >= 4 else "0000"
            replacement = f"**** **** **** {last4}"
            detections.append({
                "entity_type": "CREDIT_CARD",
                "raw_preview": raw[:4] + "... (Redacted)",
                "masked_preview": replacement,
                "start": match.start(),
                "end": match.end()
            })
            masked = masked.replace(raw, replacement)

        # 2. Email
        for match in re.finditer(self.EMAIL_REGEX, text):
            raw = match.group(0)
            parts = raw.split("@")
            prefix = parts[0][:2] if len(parts[0]) >= 2 else parts[0][:1]
            replacement = f"{prefix}***@{parts[1]}"
            detections.append({
                "entity_type": "EMAIL",
                "raw_preview": raw,
                "masked_preview": replacement,
                "start": match.start(),
                "end": match.end()
            })
            masked = masked.replace(raw, replacement)

        # 3. Phone
        for match in re.finditer(self.PHONE_REGEX, text):
            raw = match.group(0)
            clean_digits = re.sub(r'\D', '', raw)
            last4 = clean_digits[-4:] if len(clean_digits) >= 4 else "0000"
            replacement = f"***-***-{last4}"
            detections.append({
                "entity_type": "PHONE",
                "raw_preview": raw,
                "masked_preview": replacement,
                "start": match.start(),
                "end": match.end()
            })
            masked = masked.replace(raw, replacement)

        # 4. SSN / Government ID
        for match in re.finditer(self.SSN_REGEX, text):
            raw = match.group(0)
            replacement = f"***-**-{raw[-4:]}"
            detections.append({
                "entity_type": "GOV_ID",
                "raw_preview": raw,
                "masked_preview": replacement,
                "start": match.start(),
                "end": match.end()
            })
            masked = masked.replace(raw, replacement)

        return {
            "original_text": text,
            "masked_text": masked,
            "entities_count": len(detections),
            "detections": detections
        }

pii_service = PIIService()
