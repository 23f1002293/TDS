from typing import List

def longest_positive_streak(nums: List[int]) -> int:
    """
    Returns the length of the longest run of consecutive numbers > 0.
    An empty list returns 0. Non-positive numbers reset the streak.
    """
    max_streak = 0
    current_streak = 0
    for num in nums:
        if num > 0:
            current_streak += 1
        else:
            max_streak = max(max_streak, current_streak)
            current_streak = 0
    max_streak = max(max_streak, current_streak)
    return max_streak