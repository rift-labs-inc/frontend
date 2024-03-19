def multiply_32_bytes_by_ratio(
    num: bytes, ratio_numerator: int, ratio_denominator: int
) -> bytes:
    FRAC_BITS = 16
    FRAC_MULTIPLIER = 1 << FRAC_BITS

    # Convert the ratio to fixed-point representation
    ratio_fixed = (ratio_numerator << FRAC_BITS) // ratio_denominator

    # Multiply the 32-byte number by the fixed-point ratio
    result = 0
    for byte in num[::-1]:
        result = (result << 8) | byte

    result = result * ratio_fixed

    # Extract the integer part of the result
    result >>= FRAC_BITS

    # Convert the result back to a 32-byte array
    result_bytes = result.to_bytes(32, byteorder="big")

    return result_bytes

MAX_TARGET = 0x00000000FFFF0000000000000000000000000000000000000000000000000000

def get_new_target(old_bits, t_delta):
    prior_target = old_bits
    target_span = 14 * 24 * 60 * 60
    span = t_delta
    span = min(max(span, target_span / 4), target_span * 4)
    new_target = (prior_target * span) / target_span
    return int(new_target)

# let new_target = (old_target * actual_timespan as Field)/TARGET_TIMESPAN as Field;

actual_timespan = 1143368
target_timespan = 1209600
old_target = "038c120000000000000000000000000000000000000000"

real = get_new_target(int.from_bytes(bytes.fromhex(old_target)), actual_timespan)

print("Real:", real)

print(
    multiply_32_bytes_by_ratio(
        bytes.fromhex(old_target), actual_timespan, target_timespan
    ).hex()
)
