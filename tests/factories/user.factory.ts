import { User } from '@clerk/nextjs/server';

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user_123',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [
      {
        id: 'email_123',
        emailAddress: 'test@example.com',
        verification: { status: 'verified', strategy: 'email_code' },
        linkedTo: [],
      },
    ],
    primaryEmailAddressId: 'email_123',
    hasImage: false,
    imageUrl: 'https://example.com/avatar.jpg',
    publicMetadata: {},
    privateMetadata: {},
    unsafeMetadata: {},
    username: null,
    primaryEmailAddress: {
      id: 'email_123',
      emailAddress: 'test@example.com',
      verification: { status: 'verified', strategy: 'email_code' },
      linkedTo: [],
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    externalId: null,
    lastSignInAt: Date.now(),
    banned: false,
    locked: false,
    passwordEnabled: true,
    twoFactorEnabled: false,
    profileImageUrl: 'https://example.com/avatar.jpg',
    primaryPhoneNumberId: null,
    phoneNumbers: [],
    primaryPhoneNumber: null,
    primaryWeb3WalletId: null,
    web3Wallets: [],
    primaryWeb3Wallet: null,
    externalAccounts: [],
    ...overrides,
  } as User;
}
