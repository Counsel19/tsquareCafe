import { generate } from "@pdfme/generator";
import { barcodes, image, text } from "@pdfme/schemas";
import { Font } from "@/types/pdfme";
import premiumSlipTemplate from "@/lib/templates/premiumSlipTemplate.json";
import type { Template } from "@pdfme/common";
import { format } from "date-fns";
import QRCode from "qrcode";
import { verificationResponseType } from "@/types/service";

const generateQR = async (text: string) => {
  try {
    const res = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 0,
    });

    return res;
  } catch (err) {
    console.error(err);
  }
};

const PremiumSlip = async (res: verificationResponseType) => {
  // @ts-ignore
  const template: Template = premiumSlipTemplate;

  const { data } = res;

  const { surname, firstname, middlename, birthdate, nin, photo, gender } =
    data;


  const fetchFont = async () => {
    const font: Font = {
      Consolas: {
        data: await fetch("/fonts/ConsolasRegular.TTF").then((res) =>
          res.arrayBuffer()
        ),
        fallback: true,
      },
      ComicSans: {
        data: await fetch("/fonts/ComicSans.TTF").then((res) =>
          res.arrayBuffer()
        ),
        fallback: false,
      },
      CalibriBold: {
        data: await fetch("/fonts/CalibriBold.TTF").then((res) =>
          res.arrayBuffer()
        ),
        fallback: false,
      },
    };

    return font;
  };

  const generatePDF = async () => {
    try {
      const font = await fetchFont();

      const qrcode = (await generateQR(`{ surname: ${surname},
            givenNames: ${firstname} ${middlename}, dob: ${birthdate}}`)) as string;

      const inputs = [
        {
          surname: surname.toUpperCase(),
          givenNames: `${firstname}, ${middlename}`.toUpperCase(),
          dob: format(new Date(birthdate), "dd MMM yyyy"),
          gender,
          NGA: "NGA",
          photo: `data:image/jpeg;base64,${photo}`,
          nin: `${nin.slice(0, 4)} ${nin.slice(3, 6)} ${nin.slice(5, -1)}`,
          issuedDate: format(new Date(), "dd MMM yyyy"),
          ninBackdrop1: nin,
          ninBackdrop2: nin,
          ninBackdrop3: nin,
          ninBackdrop4: nin,
          qrcode,
        },
      ];

      const pdf = await generate({
        template,
        inputs,
        plugins: {
          text,
          image,
          qrcode: barcodes.qrcode,
        },
        options: { font },
      });

      return new Blob([pdf.buffer], { type: "application/pdf" });
    } catch (error) {
      console.log(error);
    }
  };

  return await generatePDF();
};

export default PremiumSlip;
