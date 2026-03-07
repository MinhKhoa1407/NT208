import { adminAuth } from "@/app/lib/firebase_admin";
import { rtDb } from "@/app/lib/firebase"; 
import { ref, get, set } from "firebase/database";
import { NextResponse } from "next/server";

export async function POST (request : Request) {
    try {
        const { idToken } = await request.json();

        const decodeToken = await adminAuth.verifyIdToken(idToken);
        const { uid, email, name } = decodeToken;

        const userRef = ref(rtDb, `users/${uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();
            return NextResponse.json({
                message: "Đăng nhập Google thành công!",
                user: userData
            }, { status: 200 });
        }
        else {
            const newUser = {
                "_id": uid,
                "username": email?.split('@')[0],
                "email": email,
                "affiliation": "",
                "roles": [],
                "created_at": new Date().toISOString()
            };

            await set(userRef, newUser);

            return NextResponse.json({
                message: "Tạo tài khoản Google mới thành công!",
                user: newUser
            }, { status: 201 });
        }
    }
    catch (error : any) {
        return NextResponse.json({ error: "Xác thực Google thất bại" }, { status: 401 });
    }
}