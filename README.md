# KASA-TALK API SPEC

### base url : `https://kasa-talk-tpe6yyswta-as.a.run.app`

## User Endpoint

### - Register

- Path :
  - `/register`
- Method:
  - `POST`
- Request
  - body request
  ```
  {
    "name": "johndu",
    "email": "johndu@gmail.com",
    "password": "xxxx",
    "confirmPassword": "xxxx"
  }
  ```
- Response
  ```
  {
      "error": [],
      "message": "Register success, please cek your email to activate your account",
      "data": {
          "userId": "0f223698-30aa-499a-9f84-28d44aee2dbd",
          "name": "johndu",
          "email": "johndu@gmail.com",
          "password": "$2b$10$.r52zrTTvLIrfmao//6sheR/T89.hB.h2VqqEZVM9KDKQ7sT7UG8q"
          "createdAt": "2023-06-03T17:11:01.523Z",
          "updatedAt": "2023-06-03T17:11:01.525Z",
      }
  }
  ```

### - Login

- Path :
  - `/login`
- Method:
  - `POST`
- Request
  - body request
  ```
  {
    "email": "johndu@gmail.com",
    "password": "xxxx",
  }
  ```
- Response
  ```
  {
      "error": [],
      "message": "Login Success",
      "data": {
          "userId": "0f223698-30aa-499a-9f84-28d44aee2dbd",
          "name": "johndu",
          "email": "johndu@gmail.com",
          "accessToken": "xxx" 
      }
  }
  ```

### - Get User Account

- Path :
  - `/user/:userId`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  { 
      "error": [],
      "message": "Get User Account",
      "data": {
          "userId": "0f223698-30aa-499a-9f84-28d44aee2dbd",
          "name": "johndu",
          "email": "johndu@gmail.com",
          "avatarUrl": "xxx"
          "createdAt": "2023-06-03T17:11:01.523Z",
          "updatedAt": "2023-06-03T17:11:01.525Z",
      }
  }
  ```

### - Update User Account

- Path :
  - `/user/:userId`
- Method:
  - `PATCH`
- Header:
  - Authorization: Bearer - token
- Request
  - body request (it can be one or all object request)
  ```
  {
    "email": "newjohndu@gmail.com",
    "name": "newjohndu",
    "password": "xxx"
  }
  ```
- Response
  ```
  { 
      "error": [],
      "message": "Update user account success, please cek your email to re-activate",
      "data": {
          "email": "newjohndu@gmail.com",
          "name": "newjohndu",
          "password": "$2b$10$.r52zrTTvLIrfmao//6sheR/T89.hB.h2VqqEZVM9KDKQ7sT7UG8q"
          "updatedAt": "2023-06-03T17:11:01.525Z",
      }
  }
  ```

### - Update Avatar User Account

- Path :
  - `/user/avatar/:userId`
- Method:
  - `PATCH`
- Header:
  - Authorization: Bearer - token
- Request
  - form data (keyfile: avatar)
- Response
  ```
  { 
      "error": [],
      "message": "Update Avatar User Success",
      "data": {
          "avatarUrl": "xxx",
      }
  }
  ```

### - Forgot-Password

- Path :
  - `/user/forgot-password/:userId`
- Method:
  - `GET`
- Request
  - body request 
  ```
  {
    "email": "johndu@gmail.com"
  }
  ```
- Response
  ```
  { 
      "error": [],
      "message": "Get New Password Success, please cek your email",
      "data": null
  }
  ```

### - List All Kata

- Path :
  - `/kata`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  { 
      "error": [],
      "message": "Get Kata Success",
      "data": {
          "indonesia": "xxx",
          "sasak": "xxx",
          "audio": "xxx",
          "contoh penggunaan": "xxx"
      }
  }
  ```

  ### - add Kata

- Path :
  - `/kata`
- Method:
  - `POST`
- Header:
  - Authorization: Bearer - token
- Request
  - body request (it depend what you want to edit)
  ```
  {
    "indonesia": "xxx",
    "sasak": "xxx",
    "audioUrl": "xxx",
    "contohPenggunaan": "xxx",
  }
  ```
- Response
  ```
  { 
      "error": [],
      "message": "add Kata Success",
  }
  ```

### - Search Kata Indonesia - Sasak

- Path :
  - `/kata/t/indonesia?cari=`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Request
  - query paramte (it depend what you want to edit)
- Response
  ```
  { 
      "error": [],
      "message": "Get Kata Success",
      "data": {
          "sasak": "xxx",
          "audio": "xxx",
          "contoh penggunaan": "xxx"
      }
  }
  ```

### - Search Kata Sasak - Indonesia

- Path :
  - `/kata/t/sasak?cari=`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Request
  - body request (it depend what you want to edit)
  ```
  {
    "sasak": "xxx",
  }
  ```
- Response
  ```
  { 
      "error": [],
      "message": "Get Kata Success",
      "data": {
          "indonesia": "xxx",
          "audio": "xxx",
          "contoh penggunaan": "xxx"
      }
  }
  ```
### - Get Top Contributor

- Path :
  - `/user/top-contributor`
- Method:
  - `GET`
- Response
  ```
  { 
      "error": [],
      "message": "Get Top Cotributor Success",
      "data": [
        {
            "name": "johndu",
            "avatarUrl": "xxx",
            "jumlahKata": 233
        },
        {
            "name": "johndu",
            "avatarUrl": "xxx",
            "jumlahKata": 233
        },
        {
            "name": "johndu",
            "avatarUrl": "xxx",
            "jumlahKata": 233
        }
        ...
      ]
  }
  ```

## Admin Endpoint

### - Login

- Path :
  - `/admin/login`
- Method:
  - `POST`
- Request
  - body request
  ```
  {
    "email": "johndu@gmail.com",
    "password": "xxxx",
  }
  ```
- Response
  ```
  {
      "error": [],
      "message": "Login Success",
      "data": {
          "userId": "0f223698-30aa-499a-9f84-28d44aee2dbd",
          "name": "johndu",
          "email": "johndu@gmail.com",
          "role": "admin"
          "accessToken": "xxx" 
      }
  }
  ```

### - Get All Kosa-Kata

- Path :
  - `/admin/kosa-kata`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  {
      "error": [],
      "message": "Register success, please cek your email to activate your account",
      "data": [
        {
          "kataId": "xxx",
          "indonesia": "johndu",
          "sasak": "johndu@gmail.com",
          "audioUrl": "xxx"
          "contohPenggunaan": "xxx"
          "status": ["approve", "pending", "reject"],
          "createdAt": "2023-06-03T17:11:01.523Z",
          "updatedAt": "2023-06-03T17:11:01.525Z",
        },
        {
          "kataId": "xxx",
          "indonesia": "johndu",
          "sasak": "johndu@gmail.com",
          "audioUrl": "xxx"
          "contohPenggunaan": "xxx"
          "status": ["approve", "pending", "reject"],
          "createdAt": "2023-06-03T17:11:01.523Z",
          "updatedAt": "2023-06-03T17:11:01.525Z",
        },
        {
          "kataId": "xxx",
          "indonesia": "johndu",
          "sasak": "johndu@gmail.com",
          "audioUrl": "xxx"
          "contohPenggunaan": "xxx"
          "status": ["approve", "pending", "reject"],
          "createdAt": "2023-06-03T17:11:01.523Z",
          "updatedAt": "2023-06-03T17:11:01.525Z",
        },
        ...
      ]
  }
  ```

  ### - Get All Contributor

- Path :
  - `/admin/contributor`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  {
      "error": [],
      "message": "Get All Contributor Success",
      "data": [
        {
          "kataId": "xxx",
          "indonesia": "johndu",
          "sasak": "johndu@gmail.com",
          "audioUrl": "xxx"
          "contohPenggunaan": "xxx"
          "updatedAt": "2023-06-03T17:11:01.525Z",
          "userId": "0f223698-30aa-499a-9f84-28d44aee2dbd",
          "name": "johndu",
          "avatarUrl": "xxx"
        },
        {
          "kataId": "xxx",
          "indonesia": "johndu",
          "sasak": "johndu@gmail.com",
          "audioUrl": "xxx"
          "contohPenggunaan": "xxx"
          "updatedAt": "2023-06-03T17:11:01.525Z",
          "userId": "0f223698-30aa-499a-9f84-28d44aee2dbd",
          "name": "johndu",
          "avatarUrl": "xxx"
        },
        {
          "kataId": "xxx",
          "indonesia": "johndu",
          "sasak": "johndu@gmail.com",
          "audioUrl": "xxx"
          "contohPenggunaan": "xxx"
          "updatedAt": "2023-06-03T17:11:01.525Z",
          "userId": "0f223698-30aa-499a-9f84-28d44aee2dbd",
          "name": "johndu",
          "avatarUrl": "xxx"
        },
        ...
      ]
  }
  ```

### - Update Kata

- Path :
  - `/admin/kata/:kataId`
- Method:
  - `PATCH`
- Header:
  - Authorization: Bearer - token
- Request
  - body request (it depend what you want to edit)
  ```
  {
    "status": ["approve", "pending", "reject"],
  }
  ```
- Response
  ```
  { 
      "error": [],
      "message": "Edit Kata Success",
  }
  ```

### - Delete Kata

- Path :
  - `/admin/kata/:kataId`
- Method:
  - `DELETE`
- Header:
  - Authorization: Bearer - token
- Request
  - body request (it depend what you want to edit)
  ```
  {
    "id": "xxx",
  }
  ```
- Response
  ```
  { 
      "error": [],
      "message": "delete Kata Success",
  }
  ```
  
### - Get Dashboard

- Path :
  - `/admin/dashboard`
- Method:
  - `GET`
- Request
  - body request
  ```
  {}
  ```
- Response
  ```
  {
      "error": [],
      "message": "retrive data Success",
      "data": {
          "kontributor": "99",
          "jumlah kata": "99",
          "jumlah pengguna": "99", 
      }
  }
  ```