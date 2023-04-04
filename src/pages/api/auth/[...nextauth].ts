import NextAuth from "next-auth";

import { authOptions } from "../../../services/nextAuth";
export default NextAuth(authOptions);