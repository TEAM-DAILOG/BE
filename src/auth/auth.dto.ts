export class CheckSignupEmailDto {
  email: string;
}

export class SignupDto {
  email: string;
  password: string;
  name: string;
  profileImageUrl?: string | null;
  termsOfServiceAgreed: boolean;
  privacyPolicyAgreed: boolean;
  marketingAgreed?: boolean;
}
