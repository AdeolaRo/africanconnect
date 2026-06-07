import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      path?: string;
      role?: string;
      profileCompleted?: boolean;
    };
  }

  interface User {
    path?: string;
    role?: string;
    profileCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    path?: string;
    role?: string;
    profileCompleted?: boolean;
  }
}
