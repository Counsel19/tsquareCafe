import { noPhotoString } from "@/lib/imageBlob";
import isBase64 from "is-base64";
import axios, { AxiosResponse } from "axios";

const baseURL = "https://api.prembly.com";
const headers = {
  "Content-Type": "application/json",
  "x-api-key": process.env.VERIFICATION_API_KEY,
  "app-id": process.env.VERIFICATION_APP_ID,
};

const ninVerify = async (nin: string) => {
  try {
    return await axios.post(
      `${baseURL}/identitypass/verification/vnin`,
      {
        number_nin: nin,
      },
      { headers }
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

const vninVerify = async (vnin: string) => {
  try {
    return await axios.post(
      `${baseURL}/identitypass/verification/vnin`,
      {
        number: vnin,
      },
      { headers }
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

export async function POST(req: Request) {
  const { nin, vnin } = await req.json();

  try {
    let res: AxiosResponse;
    if (nin) {
      // @ts-ignore
      res = await ninVerify(nin);
    } else {
      // @ts-ignore
      res = await vninVerify(vnin);
    }

    if (res.data.status) {
      const photoUrlStringNew = res.data.nin_data.photo.replace(/\n/g, "");
      const signatureUrlStringNew = res.data.nin_data?.signature.replace(
        /\n/g,
        ""
      );

      return new Response(
        JSON.stringify({
          data: {
            ...res.data.nin_data,
            photo: isBase64(photoUrlStringNew)
              ? photoUrlStringNew
              : noPhotoString,
            signature: isBase64(signatureUrlStringNew)
              ? signatureUrlStringNew
              : noPhotoString,
          },
          reference: res.data.verification?.reference,
          status: res.data?.status,
        }),
        { status: 200 }
      );
    } else {
      if (res?.data?.message) {
        return new Response(res.data.message, {
          status: 500,
        });
      } else {
        return new Response("Something Went Wrong, Please try again latter", {
          status: 500,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return new Response("Could not verify, please try again", {
      status: 500,
    });
  }
}
