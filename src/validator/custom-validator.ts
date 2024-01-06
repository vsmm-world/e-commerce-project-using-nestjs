import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'customEmail', async: false })
export class CustomEmailValidator implements ValidatorConstraintInterface {
  validate(email: string, args: ValidationArguments) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]/;
    return emailRegex.test(email);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid email format (e.g., test12@example.com)';
  }
}

@ValidatorConstraint({ name: 'customText', async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    // you can check for minimum length, uppercase, lowercase, and special characters
    const isValid =
      text.length >= 8 &&
      /[a-z]/.test(text) &&
      /[A-Z]/.test(text) &&
      /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(text);

    return isValid;
  }

  defaultMessage(args: ValidationArguments) {
    return `Password is not strong enough`;
  }
}
