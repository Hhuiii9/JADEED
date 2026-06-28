import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, phone, password, confirmPassword } = body;

    // Backend validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email: emailLower });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      phone: phone.trim(),
      password_hash: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
