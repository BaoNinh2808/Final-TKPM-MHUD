# **Upload to IPFS**

Đồ án cho cuối kỳ Thiết kế phần mềm + Mã hóa ứng dụng

# Thành viên:

- 21120004 : Ninh Quốc Bảo
- 21120027 : Nguyễn Lê Hải Sơn
- 21120471 : Phan Gia Huy

# Cách chạy repo:

## Install các thư viện cần thiết

- B1: Install node.js và npm ([Link to docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))

    `npm install -g npm`

- B2: Install các thư viện cần thiết:

    `npm install axios form-data`

## Thay đổi đường dẫn đến file muốn upload

Đổi dòng 8 trong **index.js** : `const src = "Orig1708.png";` thành đường dẫn file muốn upload.

## Chạy code để upload

`node index.js`

## Kiểm tra xem file đã có trên ipfs chưa:

Vào link sau để xem:

 `https://peach-necessary-quail-650.mypinata.cloud/ipfs/QmXEKZkFjVxE8WUeaEFqwNTQxpWpy18bqLtk9H2jNTRdvM`

Với **QmXEKZkFjVxE8WUeaEFqwNTQxpWpy18bqLtk9H2jNTRdvM** là hash (CID) của file vừa mới upload. Thay thế đường dẫn cho phù hợp.
