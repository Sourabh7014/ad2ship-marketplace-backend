/// <reference types="jest" />

import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserAuthService } from './auth/auth.service';
import { UserProfileService } from './profile/profile.service';
import { UserAddressService } from './address/address.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class {
    sign() {
      return 'mock_jwt_token_123';
    }
  },
}));

describe('User API Service Tests (Myntra-style flow)', () => {
  let authService: UserAuthService;
  let profileService: UserProfileService;
  let addressService: UserAddressService;

  let mockPrisma: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      otpVerification: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      userAddress: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      personalAccessToken: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((callback: any) => {
        if (typeof callback === 'function') {
          return callback(mockPrisma);
        }
        return Promise.all(callback);
      }),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token_123'),
    };

    authService = new UserAuthService(mockPrisma, mockJwtService);
    profileService = new UserProfileService(mockPrisma);
    addressService = new UserAddressService(mockPrisma);
  });

  describe('Phone Normalization', () => {
    it('should normalize country code and phone number properly', () => {
      expect(authService.normalizePhone('9876543210', '+91').phone).toBe('9876543210');
      expect(authService.normalizePhone('9876543210', '+91').countryCode).toBe('+91');
      expect(authService.normalizePhone('9876543210', '91').countryCode).toBe('+91');
      expect(authService.normalizePhone('+919876543210').phone).toBe('9876543210');
      expect(authService.normalizePhone('09876543210').phone).toBe('9876543210');
      expect(authService.normalizePhone('98765 43210').phone).toBe('9876543210');
    });
  });

  describe('Send OTP & Verify OTP', () => {
    it('should send OTP and identify as new user if phone does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.otpVerification.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.otpVerification.create.mockResolvedValue({ id: BigInt(1) });

      const res = await authService.sendOtp({ phone: '9876543210' });
      expect(res.status).toBe(true);
      expect(res.data?.isNewUser).toBe(true);
      expect(res.data?.otp).toBeDefined();
    });

    it('should register new user on OTP verification', async () => {
      mockPrisma.otpVerification.findFirst.mockResolvedValue({
        id: BigInt(1),
        phone: '9876543210',
        otp: '123456',
      });
      mockPrisma.otpVerification.update.mockResolvedValue({});
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: BigInt(10),
        phone: '9876543210',
        name: '',
        role: 'user',
        status: 0,
        softDelete: 0,
        phoneVerifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authService.verifyOtp({ phone: '9876543210', otp: '123456' });
      expect(res.status).toBe(true);
      expect(res.data?.isNewUser).toBe(true);
      expect(res.data?.token).toBe('mock_jwt_token_123');
      expect(res.data?.user?.phone).toBe('9876543210');
    });

    it('should log in existing user on OTP verification', async () => {
      mockPrisma.otpVerification.findFirst.mockResolvedValue({
        id: BigInt(2),
        phone: '9876543210',
        otp: '654321',
      });
      mockPrisma.otpVerification.update.mockResolvedValue({});
      mockPrisma.user.findFirst.mockResolvedValue({
        id: BigInt(10),
        phone: '9876543210',
        name: 'Existing User',
        email: 'user@example.com',
        role: 'user',
        status: 0,
        softDelete: 0,
        phoneVerifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authService.verifyOtp({ phone: '9876543210', otp: '654321' });
      expect(res.status).toBe(true);
      expect(res.data?.isNewUser).toBe(false);
      expect(res.message).toBe('Login successful');
    });

    it('should reject invalid OTP', async () => {
      mockPrisma.otpVerification.findFirst.mockResolvedValue(null);

      const res = await authService.verifyOtp({ phone: '9876543210', otp: '000000' });
      expect(res.status).toBe(false);
      expect(res.message).toContain('Invalid or expired OTP');
    });
  });

  describe('Profile Management', () => {
    it('should get profile with address count', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: BigInt(10),
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        gender: 1,
        dateOfBirth: new Date('1995-05-20'),
        alternatePhone: null,
        role: 'user',
        _count: { addresses: 2 },
        phoneVerifiedAt: new Date(),
        emailVerifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await profileService.getProfile('10');
      expect(res.status).toBe(true);
      expect(res.data.name).toBe('Rahul Sharma');
      expect(res.data.gender).toBe(1);
      expect(res.data.dateOfBirth).toBe('20-05-1995');
      expect(res.data.savedAddressesCount).toBe(2);
    });

    it('should update profile with name, email, gender, dob', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: BigInt(10),
        email: null,
      });
      mockPrisma.user.findFirst.mockResolvedValueOnce(null); // email uniqueness check
      mockPrisma.user.update.mockResolvedValue({
        id: BigInt(10),
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        gender: 1,
        dateOfBirth: new Date(Date.UTC(1995, 4, 20)),
        alternatePhone: '9876500000',
        role: 'user',
        updatedAt: new Date(),
      });

      const res = await profileService.updateProfile('10', {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        gender: 'MALE' as any,
        dateOfBirth: '20-05-1995',
        alternatePhone: '9876500000',
      });

      expect(res.status).toBe(true);
      expect(res.data.name).toBe('Rahul Sharma');
      expect(res.data.email).toBe('rahul@example.com');
      expect(res.data.gender).toBe(1);
      expect(res.data.dateOfBirth).toBe('20-05-1995');
    });

    it('should throw ConflictException if updated email belongs to another user', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: BigInt(10),
        email: 'old@example.com',
      });
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: BigInt(99),
        email: 'taken@example.com',
      }); // taken by someone else

      await expect(
        profileService.updateProfile('10', { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should soft delete user on deleteAccount', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: BigInt(10), softDelete: 0 });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.userAddress.updateMany.mockResolvedValue({});

      const res = await profileService.deleteAccount('10', { reason: 'No longer needed' });
      expect(res.status).toBe(true);
      expect(res.message).toContain('deleted successfully');
    });
  });

  describe('Address Management', () => {
    it('should create an address and set as default if first address', async () => {
      mockPrisma.userAddress.count.mockResolvedValue(0);
      mockPrisma.userAddress.create.mockResolvedValue({
        id: BigInt(101),
        userId: BigInt(10),
        name: 'Rahul Sharma',
        phone: '9876543210',
        pincode: '560001',
        addressLine1: 'Flat 402, Sunshine Heights',
        addressLine2: 'Indiranagar',
        landmark: 'Near Metro Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'IN',
        addressType: 'HOME',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await addressService.createAddress('10', {
        name: 'Rahul Sharma',
        phone: '9876543210',
        pincode: '560001',
        addressLine1: 'Flat 402, Sunshine Heights',
        addressLine2: 'Indiranagar',
        landmark: 'Near Metro Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        addressType: 'HOME' as any,
      });

      expect(res.status).toBe(true);
      expect(res.data?.isDefault).toBe(true);
      expect(res.data?.city).toBe('Bengaluru');
    });

    it('should get all addresses for user sorted with default first', async () => {
      mockPrisma.userAddress.findMany.mockResolvedValue([
        {
          id: BigInt(101),
          userId: BigInt(10),
          name: 'Home',
          phone: '9876543210',
          pincode: '560001',
          addressLine1: 'Line 1',
          city: 'Bengaluru',
          state: 'Karnataka',
          country: 'IN',
          addressType: 'HOME',
          isDefault: true,
        },
        {
          id: BigInt(102),
          userId: BigInt(10),
          name: 'Office',
          phone: '9876543210',
          pincode: '560002',
          addressLine1: 'Line 2',
          city: 'Bengaluru',
          state: 'Karnataka',
          country: 'IN',
          addressType: 'WORK',
          isDefault: false,
        },
      ]);

      const res = await addressService.getAddresses('10');
      expect(res.status).toBe(true);
      expect(res.data?.length).toBe(2);
      expect(res.data?.[0]?.isDefault).toBe(true);
    });

    it('should set an address as default and unset previous default', async () => {
      mockPrisma.userAddress.findFirst.mockResolvedValue({
        id: BigInt(102),
        userId: BigInt(10),
        isDefault: false,
      });
      mockPrisma.userAddress.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.userAddress.update.mockResolvedValue({
        id: BigInt(102),
        userId: BigInt(10),
        name: 'Office',
        phone: '9876543210',
        pincode: '560002',
        addressLine1: 'Line 2',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'IN',
        addressType: 'WORK',
        isDefault: true,
      });

      const res = await addressService.setDefaultAddress('10', '102');
      expect(res.status).toBe(true);
      expect(res.data?.isDefault).toBe(true);
    });

    it('should delete address and assign next default if deleted was default', async () => {
      mockPrisma.userAddress.findFirst
        .mockResolvedValueOnce({
          id: BigInt(101),
          userId: BigInt(10),
          isDefault: true,
        })
        .mockResolvedValueOnce({
          id: BigInt(102),
          userId: BigInt(10),
          isDefault: false,
        });

      mockPrisma.userAddress.update.mockResolvedValue({});

      const res = await addressService.deleteAddress('10', '101');
      expect(res.status).toBe(true);
      expect(res.message).toBe('Address deleted successfully');
    });
  });
});
