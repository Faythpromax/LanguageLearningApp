# LanguageLearningApp
Ứng dụng học ngoại ngữ

Ứng dụng cung cấp các chức năng như học từ vựng, ngữ pháp và làm kiểm tra. Ứng dụng tích hợp AI nhằm hỗ trợ người dùng học (luyện hội thoại, giải thích lỗi sai,...)
Tham khảo: Elsa, Duolingo,...

Các chức năng chính:
- Authentication/Phân quyền
- Học từ vựng (kiểu flashcard) (có thể theo chủ đề hoặc không)
- Học ngữ pháp (Xem ngữ pháp + câu ví dụ + 1 bài tập mẫu)
- Làm bài kiểm tra
- Hội thoại AI

Công nghệ sử dụng: Node js, React Native, ExpressJS, MongoDB

extra package:
- backend: express mongoose dotenv bcryptjs jsonwebtoken
- frontend: @react-navigation/native @native-stack @react-native-screens react-native-screens react-native-safe-area-context @react-navigation/native-stack @react-navigation/bottom-tabs @reduxjs/toolkit react-redux

Giao diện: dùng bottom tab (@react-navigation/bottom-tabs) sau khi đăng nhập:
- Người học:
  - Học: flashcard kiểu Anki (stack New + Review, nút Again / Good, Add more cards)
  - Ngữ pháp: danh sách gọn + tìm kiếm, chạm để xem dạng thẻ (chỉ xem)
  - Tài khoản: số từ mới mỗi ngày, đổi ngôn ngữ, đăng xuất
- Admin:
  - Tổng quan: tổng số từ vựng, bài ngữ pháp
  - Từ vựng / Ngữ pháp: danh sách gọn + tìm kiếm, thêm / sửa / xóa
  - Tài khoản: đổi ngôn ngữ, đăng xuất

Hướng dẫn chạy:
- backend:
cd backend
node src/server.js hoặc npm run dev
adb reverse tcp:3000 tcp:3000 để kết nối điện thoại với backend
npm run seed:admin   tạo tài khoản admin từ .env
npm run seed:words   nhập từ vựng mẫu từ seeding/words.json
npm run seed:grammars   nhập bài ngữ pháp mẫu từ seeding/grammars.json
npm test             chạy test backend
- frontend: 
npm run android