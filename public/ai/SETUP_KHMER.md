# របៀបដំឡើង និង ប្រើប្រាស់ Google Gemini API Key
# How to Setup and Use Google Gemini API Key

## សំណួរទូទៅ / Overview

ឯកសារនេះជាមគ្គុទ្ទេសក៍ជំនួយដើម្បីបង្រៀនអ្នកពីរបៀបដំឡើង និង ប្រើប្រាស់ Google Gemini API Key សម្រាប់ Amertak AI ។
This document is a guide to teach you how to setup and use Google Gemini API Key for Amertak AI.

---

## ជំហ៊ានទី ១៖ ទៅ Google AI Studio
## Step 1: Go to Google AI Studio

1. បើកកម្មវិធីរុករក (Browser) របស់អ្នក (Chrome, Firefox, Edge, etc.)
   Open your web browser (Chrome, Firefox, Edge, etc.)

2. ទៅកាន់គេហទំព័រ៖ https://aistudio.google.com/app/apikey
   Go to the website: https://aistudio.google.com/app/apikey

3. ចុះឈ្មោះជាមួយ Google Account របស់អ្នក (Gmail)
   Sign in with your Google Account (Gmail)

---

## ជំហ៊ានទី ២៖ បង្កើត API Key ថ្មី
## Step 2: Create New API Key

1. បន្ទាប់ពីចូលដោយជោគជ័យ អ្នកនឹងឃើញផ្ទាំងបញ្ជា (Dashboard)
   After successful login, you will see a Dashboard

2. ចុចលើប៊ូតុង **"Get API Key"** ឬ **"Create API Key"**
   Click on the **"Get API Key"** or **"Create API Key"** button

3. ជ្រើសរើស **"Create API Key in new project"** ឬ **"Create API Key in existing project"**
   Select **"Create API Key in new project"** or **"Create API Key in existing project"**

   - ប្រសិនបើអ្នកមាន Google Cloud Project រួចហើយ ជ្រើស **"Existing project"**
     If you already have a Google Cloud Project, select **"Existing project"**
   - ប្រសិនបើអ្នកមិនមានទេ ជ្រើស **"New project"**
     If you don't have one, select **"New project"**

4. ចុច **"Create API Key"**
   Click **"Create API Key"**

5. **ចម្លង API Key របស់អ្នក!** វាមើលទៅដូចនេះ៖
   **Copy your API Key!** It will look like this:
   ```
   AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY
   ```

   ⚠️ **សំខាន់ណាស់៖** រក្សាទុក API Key នេះឱ្យមានសុវត្ថិភាព! កុំចែករំលែកជាមួយអ្នកដទៃទៀត!
   ⚠️ **Very Important:** Keep this API Key secure! Don't share it with others!

---

## ជំហ៊ានទី ៣៖ ដំឡើង API Key ក្នុង Amertak AI
## Step 3: Install API Key in Amertak AI

### វិធីសាស្ត្រទី ១៖ សម្រាប់ការអភិវឌ្ឍន៍មូលដ្ឋាន (Local Development)
### Method 1: For Local Development

1. ស្វែងរកឯកសារ `.env` នៅក្នុងថត `public/ai/`
   Find the `.env` file in the `public/ai/` folder

2. បើកឯកសារ `.env` ជាមួយ Text Editor (Notepad, VS Code, etc.)
   Open the `.env` file with a Text Editor (Notepad, VS Code, etc.)

3. ជំនួស `your_gemini_api_key_here` ជាមួយ API Key ពិតប្រាកដរបស់អ្នក
   Replace `your_gemini_api_key_here` with your actual API Key

   ឧទាហរណ៍ / Example:
   ```env
   GEMINI_API_KEY=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY
   ```

4. រក្សាទុកឯកសារ (Save)
   Save the file

### វិធីសាស្ត្រទី ២៖ សម្រាប់ Vercel (Production)
### Method 2: For Vercel (Production)

1. ទៅកាន់ Vercel Dashboard របស់អ្នក
   Go to your Vercel Dashboard

2. ជ្រើសរើស Project របស់អ្នក (Amertak)
   Select your Project (Amertak)

3. ទៅកាន់ **Settings** → **Environment Variables**
   Go to **Settings** → **Environment Variables**

4. បន្ថែម Variable ថ្មី៖
   Add new Variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** API Key ពិតប្រាកដរបស់អ្នក
   - **Environments:** ជ្រើស **Production**, **Preview**, **Development** (ទាំងអស់)
   
5. ចុច **"Save"**
   Click **"Save"**

6. **Redeploy** សម្រាប់ឱ្យប្រើប្រាស់ API Key ថ្មី
   **Redeploy** to use the new API Key

---

## ជំហ៊ានទី ៤៖ សាកល្បងការដំឡើង
## Step 4: Test the Setup

1. បើកម៉ូដែលអភិវឌ្ឍន៍មូលដ្ឋាន (Local Development Server)
   Start the local development server

2. ទៅកាន់ទំព័រ AI Chat នៅ https://amertak.com/ai ឬ http://localhost:3000/ai
   Go to the AI Chat page at https://amertak.com/ai or http://localhost:3000/ai

3. សរសេរសារណាមួយក្នុង Chat Box ដើម្បីសាកល្បង
   Type any message in the Chat Box to test

4. ប្រសិនបើអ្នកឃើញការឆ្លើយតបពី AI មាន មីនោះអ្នកបានដំឡើងដោយជោគជ័យហើយ!
   If you see a response from AI, you have successfully installed it!

---

## ការដោះស្រាយបញ្ហា (Troubleshooting)

### បញ្ហា ១៖ API Key មិនត្រឹមត្រូវ
### Problem 1: Invalid API Key

**សញ្ញាណ៖** អ្នកឃើញសារកំហុសថា "Invalid API Key" ឬ "API Key not found"
**Sign:** You see error message "Invalid API Key" or "API Key not found"

**ដំណោះស្រាយ / Solution:**
- ពិនិត្យមើលថា API Key ត្រឹមត្រូវក្នុងឯកសារ `.env`
  Check if the API Key is correct in the `.env` file
- ធានាថា API Key មិនមានចន្លោះចន្ត (space) ដល់ពីមុខ ឬ ក្រោយ
  Ensure the API Key has no spaces before or after
- ពិនិត្យមើលថា API Key មាននៅក្នុង Google AI Studio ហើយមែនទែន
  Verify the API Key exists in Google AI Studio and is enabled

### បញ្ហា ២៖ មិនអាចចូលប្រើ API បាន
### Problem 2: Cannot Access API

**សញ្ញាណ៖** អ្នកឃើញសារកំហុសថា "Network Error" ឬ "Failed to fetch"
**Sign:** You see error message "Network Error" or "Failed to fetch"

**ដំណោះស្រាយ / Solution:**
- ពិនិត្យមើលអ៊ីនធឺណិតរបស់អ្នក
  Check your internet connection
- ពិនិត្យមើលថា Browser មិនបាន Block ការដំណើរការ (Request)
  Check if your Browser is not blocking requests
- សាកល្បងជាមួយ Browser ផ្សេងទៀត
  Try with a different Browser

### បញ្ហា ៣៖ AI មិនឆ្លើយតប
### Problem 3: AI Not Responding

**សញ្ញាណ៖** អ្នកផ្ញើសារបាត់ ប៉ុន្តែមិនទទួលបានការឆ្លើយតប
**Sign:** You send a message but don't get a response

**ដំណោះស្រាយ / Solution:**
- ពិនិត្យមើល Console នៃ Browser (F12 → Console)
  Check Browser Console (F12 → Console)
- ធានាថា API Key មានសុវត្ថិភាព និងមានសិទ្ធិប្រើប្រាស់
  Ensure the API Key is secure and has usage permissions
- ពិនិត្យមើល Quota នៃ Google AI Studio (មាន limit ក្នុងការប្រើប្រាស់ជារៀល)
  Check Quota in Google AI Studio (has usage limits per minute)

---

## ព័ត៌មានបន្ថែម (Additional Information)

### Model ដែលកំពុងប្រើប្រាស់
### Model Currently in Use

- **Model Name:** Google Gemini 2.0 Flash
- **Model ID:** `gemini-2.0-flash-exp`
- **Speed:** រហ័ស (Fast)
- **Capabilities:** 
  - យល់ឃើញអត្ថបទ (Text understanding)
  - បង្កើតអត្ថបទ (Text generation)
  - គណិតវិទ្យា (Mathematics)
  - កូដ (Coding)
  - ប្រវត្តិសាស្ត្រ (History)
  - និង ច្រើនទៀត (and more)

### អត្រាប្រើប្រាស់ (Usage Rate)

- **Free Tier:** 15 requests per minute (RPM)
- **Free Tier:** 1,500 requests per day (RPD)
- **Free Tier:** 1 million tokens per minute (TPM)

សម្រាប់ព័ត៌មានលម្អិត ទៅកាន់៖ https://ai.google.dev/pricing
For more details, visit: https://ai.google.dev/pricing

---

## ទំនាក់ទំនង (Contact)

ប្រសិនបើអ្នកមានបញ្ហា ឬ សំណួរ សូមទាក់ទងមកយើងខ្ញុំ៖
If you have issues or questions, please contact us:

- **Telegram:** @AmertakOfficial
- **Website:** https://amertak.com
- **Developer:** គីន ថាវរ៉ាត់ (Kin Thavrath)

---

## ឯកសារជំនួយផ្សេងទៀត (Other Helpful Documents)

- `README.md` - ព័ត៌មានទូទៅអំពីគម្រោង
  General information about the project
- `QUICKSTART.md` - ការចាប់ផ្តើមរហ័ស
  Quick start guide
- `DEPLOYMENT.md` - របៀបដំឡើងលើ Server
  How to deploy on Server

---

**អរគុណដែលបានប្រើ Amertak AI!**
**Thank you for using Amertak AI!**

© 2024 Amertak (អមតៈ) - Developed by គីន ថាវរ៉ាត់