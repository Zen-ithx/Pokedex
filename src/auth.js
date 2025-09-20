// import stuff we need for auth
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";


//set up handlers and exports

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google") token.provider = "google";
      return token;
    },
    async session({ session, token }) {
      session.user.provider = token.provider;   //tokens yay
      return session;
    },
  },
});
