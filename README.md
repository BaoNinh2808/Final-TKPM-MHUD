# **ADAPTIVE AUTHENTICATION & IPFS**

Đồ án cho cuối kỳ Thiết kế phần mềm + Mã hóa ứng dụng

# Thành viên:

- 21120004 : Ninh Quốc Bảo
- 21120027 : Nguyễn Lê Hải Sơn
- 21120471 : Phan Gia Huy

# Cấu trúc repo:

```
|--node_modules (thư mục chứa các library được install vào) - không cần đụng vào

|--public (thư mực chứa các file css, javascript)
    |
    |__ css : chứa các file css
    |__ img : chứa các hình ảnh sử dụng trong ứng dụng
    |__ js  : chứa các file javascript

|--src (thư mục chứa code về giao diện và xử lý của server)
    |
    |__ controllers : chứa các xử lý của server (tất cả xử lý)
    |__ routes      : chứa các file dùng để điều hướng 
                        - ứng với yêu cầu này thì gọi hàm nào của controller
    |__ views       : chứa giao diện của web - sử dụng express handlebar template
        |__ layouts     : file .hbs để hiển thị khung giao diện
        |__ partials    : các file .hbs được dùng đi dùng lại nhiều lần
|
|--package-lock.json : tự sinh ra
|--package.json : định nghĩa version của dependencies và các thông tin về ứng dụng 
```

