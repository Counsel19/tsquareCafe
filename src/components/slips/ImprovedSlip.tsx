import { generate } from "@pdfme/generator";
import { barcodes, image, text } from "@pdfme/schemas";
import { Font } from "@/types/pdfme";
import improvedSlipTemplate from "@/lib/templates/improvedSlipTemplate.json";
import type { Template } from "@pdfme/common";
import { format } from "date-fns";
import QRCode from "qrcode";
import { verificationResponseType2 } from "@/types/service";
import { toast } from "@/hooks/use-toast";

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

const ImprovedSlip = async (res: verificationResponseType2) => {
  // @ts-ignore
  const template: Template = improvedSlipTemplate;

  const { data } = res;

  const { surname, firstname, middlename, birthdate, nin, photo, gender } =
    data;

  const fetchFont = async () => {
    const font: Font = {
      OCRBRegular: {
        data: await fetch("/fonts/OCRBRegular.ttf").then((res) =>
          res.arrayBuffer()
        ),
        fallback: true,
      },
    };

    return font;
  };

  const transformData = () => {
    if (birthdate.includes("-")) {
      const [day, month, year] = birthdate?.split("-");
      const formattedBirthdate = `${month}-${day}-${year}`;

      return format(new Date(formattedBirthdate), "dd MMM yyyy")?.toUpperCase();
    } else {
      return birthdate;
    }
  };

  const generatePDF = async () => {
    try {
      const font = await fetchFont();

      const qrcode = (await generateQR(`{ surname: ${surname},
            givenNames: ${firstname} ${middlename}, dob: ${birthdate}}`)) as string;

      const inputs = [
        {
          surname: `${surname || ""}`.toUpperCase(),
          givenNames: `${firstname || ""}, ${middlename || ""}`.toUpperCase(),
          dob: transformData(),
          photo: `data:image/${
            photo.charAt(0) === "/" ? "jpeg" : "png"
          };base64,${photo}`,
          nin: `${nin?.slice(0, 4)} ${nin?.slice(4, 7)} ${nin?.slice(7)}`,
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
      return toast({
        title: "Error Generating Basic NIN Slip",
        description: "Unable to generate NIN slip type. Plese try again later",
        variant: "destructive",
      });
    }
  };

  return await generatePDF();
};

export default ImprovedSlip;
