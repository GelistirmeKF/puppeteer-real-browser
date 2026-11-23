export const getToken = async (page) => {
  try {
    const token = await page.$eval(
      '[name="cf-turnstile-response"]',
      (el) => el.value,
    );
    if (token && token.trim() !== "") {
      return token;
    }
    return null;
  } catch (error) {
    return null;
  }
};
