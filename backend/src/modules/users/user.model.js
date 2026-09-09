import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import {
  USER_ROLES,
  ACCOUNT_STATUS,
  USER_ROLE_VALUES,
  ACCOUNT_STATUS_VALUES,
} from "../../constants/roles.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator(value) {
          return emailRegex.test(value);
        },
        message: "Please provide a valid email address",
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.PATIENT,
      required: true,
    },

    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUS_VALUES,
      default: ACCOUNT_STATUS.PENDING_VERIFICATION,
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOtpHash: {
      type: String,
      select: false,
    },

    emailVerificationOtpExpires: {
      type: Date,
      select: false,
    },

    emailVerificationOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    emailVerificationOtpLastSentAt: {
      type: Date,
      default: null,
      select: false,
    },

    passwordResetOtpHash: {
      type: String,
      select: false,
    },

    passwordResetOtpExpires: {
      type: Date,
      select: false,
    },

    passwordResetOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    passwordResetOtpLastSentAt: {
      type: Date,
      default: null,
      select: false,
    },

    passwordResetTokenHash: {
      type: String,
      select: false,
    },

    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform(document, returnedObject) {
    delete returnedObject.password;

    delete returnedObject.emailVerificationOtpHash;
    delete returnedObject.emailVerificationOtpExpires;
    delete returnedObject.emailVerificationOtpAttempts;
    delete returnedObject.emailVerificationOtpLastSentAt;

    delete returnedObject.passwordResetOtpHash;
    delete returnedObject.passwordResetOtpExpires;
    delete returnedObject.passwordResetOtpAttempts;
    delete returnedObject.passwordResetOtpLastSentAt;
    delete returnedObject.passwordResetTokenHash;
    delete returnedObject.passwordResetTokenExpires;

    delete returnedObject.isDeleted;

    return returnedObject;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
