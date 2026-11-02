export enum SellerStatus {
  ACTIVE = 0,
  INACTIVE = 1,
}

export enum SellerOnboardingStatus {
  DRAFT = 1,
  SUBMITTED = 2,
  UNDER_REVIEW = 3,
  NEEDS_CORRECTION = 4,
  APPROVED = 5,
  REJECTED = 6,
}

export enum SoftDeleteStatus {
  ACTIVE = 0, // false (not deleted)
  DELETED = 1, // true (soft deleted)
}

