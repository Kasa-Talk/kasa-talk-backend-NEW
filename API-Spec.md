# KASA-TALK API SPEC

### base url : `https://kasa-talk-api-final-crbnandv3q-et.a.run.app`

### - Register (admin and user)

- Path :
  - `/api/register`
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
  - `/api/login`
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
          "id": "9addffe1-f7b2-4619-8ff3-0aa86cc7a312",
          "name": "johndu",
          "email": "johndu@gmail.com",
          "role": "user"
      },
      "accessToken": "xxx",
      "refreshToken": "xxx"
  }
  ```

### - Login (Admin)

- Path :
  - `/api/admin/login`
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
          "id": "9addffe1-f7b2-4619-8ff3-0aa86cc7a312",
          "name": "johndu",
          "email": "johndu@gmail.com",
          "role": "admin"
      },
    "accessToken": "xxx",
    "refreshToken": "xxx"
  }
  ```

### - Get User Detail Account

- Path :
  - `/api/users`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  {
    "errors": [],
    "message": "Get user by id successfully",
    "data": {
        "id": "9addffe1-f7b2-4619-8ff3-0aa86cc7a312",
        "name": "johndu",
        "email": "johndu@gmail.com",
        "avatarUrl": "xxx"
    }
  }
  ```

### - Update User Account

- Path :
  - `/api/users`
- Method:
  - `PATCH`
- Header:
  - Authorization: Bearer - token
- Request
  - body request (it can be one or all object request)
  ```
  {
    "name": "New johndu",
    "email": "johndu@gmail.com",
    "password": "xxx",
    "confirmPassword": "xxx",
    "avatarUrl: "xxx"
  }   
  ```
- Response
  ```
  { 
      "error": [],
      "message": "Update user account success",
      "data": {
          based on body request
      }
  }
  ```

### - Forgot-Password

- Path :
  - `/api/users/forgot-password`
- Method:
  - `POST`
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

  ### - Translate kata 
- Path :
  - `/api/kata`
- Query Parameter:
  - `indonesia={true or false}`
  - `search={kata}`
- Method:
  - `GET`
- Response
    ```
    {
        "errors": [],
        "message": "Translate Word Success",
        "data": [
            {
                "sasak": "lalo",
                "indonesia": "pergi",
                "contohPenggunaanSasak": "jak lalo bait kelambi",
                "contohPenggunaanIndo": "mau pergi ambil baju",
                "audioUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-audio%2F9578f4a5-0549-4b6e-a86d-42479a3fdc73-lalo.mp3?alt=media&token=23b1a4fc-08a0-4eb0-90cf-f83baead5e9a"
            }
        ]
    }
    ```

  ### - Set Kata

- Path :
  - `/api/kata`
- Method:
  - `POST`
- Header:
  - Authorization: Bearer - token
- Request
  ```
  {
    "indonesia": "test",
    "sasak": "test",
    "contohPenggunaanIndo": "test",
    "contohPenggunaanSasak": "test",
    "audioUrl": "https://firebasestorage.googleapis.com/v0/b/kasa-talk-storage.appspot.com/o/audio%2Fb8c6fbc4-f1ff-4e85-853c-a56f3ea10498-test%20audio.mp3?alt=media&token=e0598de3-c6a9-4f2b-b6c2-937204897c6c"
  }
  ```
- Response
  ```
  {
    "message": "Success Set Word",
    "data": {
        "status": "pending",
        "id": 88,
        "indonesia": "test",
        "sasak": "test",
        "contohPenggunaanIndo": "test",
        "contohPenggunaanSasak": "test",
        "audioUrl": "https://firebasestorage.googleapis.com/v0/b/kasa-talk-storage.appspot.com/o/audio%2Fb8c6fbc4-f1ff-4e85-853c-a56f3ea10498-test%20audio.mp3?alt=media&token=e0598de3-c6a9-4f2b-b6c2-937204897c6c",
        "userId": "9addffe1-f7b2-4619-8ff3-0aa86cc7a312",
        "updatedAt": "2023-12-18T03:02:22.048Z",
        "createdAt": "2023-12-18T03:02:22.048Z"
    }
  }
  ```

### - Get All User Kata

- Path :
  - `/api/kata`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token

- Response
  ```
  {
    "errors": [],
    "message": "Get User Word Success",
    "data": [
        {
            "id": 90,
            "sasak": "sdss",
            "indonesia": "ds",
            "contohPenggunaanSasak": "ds",
            "contohPenggunaanIndo": "ds",
            "audioUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-audio%2F766d7bb8-01c7-406e-94b9-a141f69a3e94-pire.mp3?alt=media&token=e530840d-7b2f-4c09-b50c-045336246b23",
            "status": "pending",
            "createdAt": "2023-12-18 11:42:19"
        },
        {
            "id": 17,
            "sasak": "lalo",
            "indonesia": "pergi",
            "contohPenggunaanSasak": "jak lalo bait kelambi",
            "contohPenggunaanIndo": "mau pergi ambil baju",
            "audioUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-audio%2F9578f4a5-0549-4b6e-a86d-42479a3fdc73-lalo.mp3?alt=media&token=23b1a4fc-08a0-4eb0-90cf-f83baead5e9a",
            "status": "active",
            "createdAt": "2023-12-14 12:50:25"
        }
    ]
  }
  ```

### - Delete User Kata By Id

- Path :
  - `/api/kata/:kataId`
- Method:
  - `DELETE`
- Header:
  - Authorization: Bearer - token

- Response
  ```
  {
    errors: [],
    message: "Delete Word Success",
    data: null,
  }
  ```

### - Refresh Token
- Path :
  - `/api/users/refresh`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - refresh token
- Response
  ```
  {
    "errors": [],
    "message": "Refresh successfully",
    "data": {
        "id": "9addffe1-f7b2-4619-8ff3-0aa86cc7a312",
        "name": "Daus",
        "email": "dausnrt@gmail.com",
        "role": "user"
    },
    "accessToken": "xxx",
    "refreshToken": "xxx"
  }
  ```

### - Delete Akun

- Path :
  - `/api/users`
- Method:
  - `DELETE`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  {
    errors: [],
    message: "Remove User Account Success",
    data: null,
  }
  ```

### - Get Top Contributor

- Path :
  - `/api/kata/top-contributor`
- Method:
  - `GET`
- Response
  ```
  {
    "errors": [],
    "message": "Get Top Contributor Success",
    "data": [
        {
            "name": "Naufal Azmi Wardhana",
            "email": "naufalazmi2002@gmail.com",
            "avatarUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-avatar%2F975cb5de-c776-4c5e-b460-458624eb88ac-GG.jpeg?alt=media&token=5c43ce98-ff6c-443d-8f2e-a15eac2745f1",
            "total": "21 kata"
        },
        {
            "name": "Galuh Satria",
            "email": "galuhsatria021@gmail.com",
            "avatarUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-avatar%2Fe120f540-8253-43d8-aa66-202fa6b0338c-WhatsApp%20Image%202023-09-18%20at%201.30.51%20PM.jpeg?alt=media&token=892ccd15-622c-450c-b82d-ae9999419e8a",
            "total": "7 kata"
        },
        {
            "name": "Lalu Rudi Setiawan",
            "email": "rudistiawannn@gmail.com",
            "avatarUrl": "https://iili.io/JzNObUP.png",
            "total": "1 kata"
        },
        {
            "name": "Alisyia Kornelia Ulandari",
            "email": "alisiyaulandari@gmail.com",
            "avatarUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-avatar%2F15d7a081-6adc-404c-993a-e54068eca80e-Screenshot_2023-11-05-22-21-39-945_com.google.android.apps.docs.jpg?alt=media&token=941cfd34-f211-4b1f-acb6-827149f3a41e",
            "total": "1 kata"
        },
        {
            "name": "Daus",
            "email": "dausnrt@gmail.com",
            "avatarUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-avatar%2F2dbe0ee2-5c50-489f-8600-b10a2cbab310-avatar.jpeg?alt=media&token=e3354105-f635-49fd-94d3-e46458a8a477",
            "total": "1 kata"
        }
    ]
  }

### - Get All Kosa-Kata (Admin)

- Path :
  - `/api/kata/all/`
- Query Parameter:
  - `status=active` 
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  {
    "errors": [],
    "message": "Get All Word Success",
    "data": {
        "result": [
            {
                "id": 17,
                "indonesia": "pergi",
                "sasak": "lalo",
                "audioUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-audio%2F9578f4a5-0549-4b6e-a86d-42479a3fdc73-lalo.mp3?alt=media&token=23b1a4fc-08a0-4eb0-90cf-f83baead5e9a",
                "contohPenggunaanIndo": "mau pergi ambil baju",
                "contohPenggunaanSasak": "jak lalo bait kelambi",
                "status": "active",
                "createdAt": "2023-12-14 12:50:25"
            },
            {
                "id": 19,
                "indonesia": "Lari",
                "sasak": "Pelai",
                "audioUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-audio%2F3aa7b90e-3ddb-4467-a75f-3d8a980bc339-14%20Des%2013.02_.mp3?alt=media&token=0008daed-3eab-403b-8e49-ca2fce0017fe",
                "contohPenggunaanIndo": "Ayok kita pergi lari",
                "contohPenggunaanSasak": "Nteh te lalo pelai",
                "status": "active",
                "createdAt": "2023-12-14 13:03:31"
            },
        ]
    }
  } 
  ```
### - Get All Kontributor (Admin)

- Path :
  - `/api/kata/all/`
- Query Parameter:
  - `status=pending` 
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  {
    "errors": [],
    "message": "Get All Word Success",
    "data": {
        "result": [
            {
                "id": 17,
                "indonesia": "pergi",
                "sasak": "lalo",
                "audioUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-audio%2F9578f4a5-0549-4b6e-a86d-42479a3fdc73-lalo.mp3?alt=media&token=23b1a4fc-08a0-4eb0-90cf-f83baead5e9a",
                "contohPenggunaanIndo": "mau pergi ambil baju",
                "contohPenggunaanSasak": "jak lalo bait kelambi",
                "status": "pending",
                "createdAt": "2023-12-14 12:50:25"
            },
            {
                "id": 19,
                "indonesia": "Lari",
                "sasak": "Pelai",
                "audioUrl": "https://firebasestorage.googleapis.com/v0/b/uploadfile-92b82.appspot.com/o/kasa-talk-audio%2F3aa7b90e-3ddb-4467-a75f-3d8a980bc339-14%20Des%2013.02_.mp3?alt=media&token=0008daed-3eab-403b-8e49-ca2fce0017fe",
                "contohPenggunaanIndo": "Ayok kita pergi lari",
                "contohPenggunaanSasak": "Nteh te lalo pelai",
                "status": "pending",
                "createdAt": "2023-12-14 13:03:31"
            },
        ]
    }
  } 
  ```

### - Aprove Word (admin)

- Path :
  - `/api/kata/confirm/:kataId`
- Method:
  - `PATCH`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  {
    "errors": [],
    "message": "Approve Word success",
    "data": null
  }
  ```

### - Decline Word (admin)

- Path :
  - `/api/kata/confirm/:kataId`
- Method:
  - `DELETE`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  {
    "errors": [],
    "message": "Decline Word success",
    "data": null
  }
  ```
  
### - Get Statistik

- Path :
  - `/api/statistik`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  {
      "error": [],
      "message": "retrive data Success",
      "data": {
          "kontributor": "99",
          "kata": "99",
          "pengguna": "99", 
      }
  }
  ```

### - Get All User (admin)

- Path :
  - `/api/admin/users`
- Method:
  - `GET`
- Header:
  - Authorization: Bearer - token
- Response
  ```
  {
    "errors": [],
    "message": "User retrieved successfully",
    "data": [
        {
            "id": "087f5dfc-62d1-43e4-bd19-fcd998b9a79b",
            "name": "Lalu Rudi Setiawan",
            "email": "rudistiawannn@gmail.com",
            "avatarUrl": "https://iili.io/JzNObUP.png",
            "isActive": true,
            "createdAt": "2023-12-14 13:10:32",
            "updatedAt": "2023-12-14 13:10:51"
        },
        {
            "id": "0e1a3e99-61ee-452f-92af-dfd2d5d04d43",
            "name": "Nur Izza Latifah",
            "email": "n.latifab@gmail.com",
            "avatarUrl": "https://iili.io/JzNObUP.png",
            "isActive": true,
            "createdAt": "2023-12-13 17:53:04",
            "updatedAt": "2023-12-13 17:54:10"
        },
    ]
  }  
  ```