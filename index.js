import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import { body, validationResult } from "express-validator";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.email,
    pass: process.env.pass,
  },
});

function trimReplace(value) {
  if (typeof value === "string") {
    return value.trim().replace(/\s+/g, " ");
  }
  return value;
}

const validateData = [
  body("name")
    .customSanitizer(trimReplace)
    .notEmpty()
    .withMessage("No name.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be 3-50 characters."),
  body("telegram").customSanitizer(trimReplace),
  body("email")
    .customSanitizer(trimReplace)
    .notEmpty()
    .withMessage("No Email.")
    .isEmail()
    .isLength({ min: 5, max: 100 })
    .withMessage("Incorrect Email"),
  body("message")
    .customSanitizer(trimReplace)
    .notEmpty()
    .withMessage("No message.")
    .isLength({ min: 10, max: 400 })
    .withMessage("Message must be 3-50 characters"),
];

app.post("/send-email", validateData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, telegram, email, message } = req.body;

    await transporter.sendMail({
      from: process.env.email,
      to: "solo991@ukr.net",
      subject: `Message from ${name}`,
      html: `<p><strong>Telegram:</strong> ${telegram}</p>
      <p><strong>Email:</strong> ${email}</p>
        <p> ${message}</p>`,
    });

    res.send("Message sent!");
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log(`Server running on port ${PORT}`);
});
