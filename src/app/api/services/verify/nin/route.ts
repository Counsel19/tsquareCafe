import { noPhotoString } from "@/lib/imageBlob";
import isBase64 from "is-base64";
import axios, { AxiosResponse } from "axios";

const baseURL = "https://directverify.com.ng/api";
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.IDVERIFYTOKEN}`,
};

const ninVerify = async (nin: string) => {
  try {
    return await axios.post(
      `${baseURL}/nin/index`,
      {
        idNumber: nin,
        idType: "NIN",
        consent: true,
      },
      { headers }
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

const vninVerify = async (vnin: string) => {
  throw Error("Service Currently unavailable!");
  return await axios.post(
    `${baseURL}/vnin`,
    {
      vnin,
    },
    { headers }
  );
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

    if (res.data?.status && res.data?.message.constructor === Object) {
      const photoUrlStringNew = res.data.message?.photo?.replace(/\n/g, "");
      const signatureUrlStringNew = res.data.message?.signature?.replace(
        /\n/g,
        ""
      );

      return new Response(
        JSON.stringify({
          data: {
            ...res.data?.message,
            photo:
              isBase64(photoUrlStringNew) && photoUrlStringNew != ""
                ? photoUrlStringNew
                : noPhotoString,
            signature:
              isBase64(signatureUrlStringNew) && signatureUrlStringNew != ""
                ? signatureUrlStringNew
                : noPhotoString,
          },
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
    return new Response("Service Not Avialable", {
      status: 500,
    });
  }
}
