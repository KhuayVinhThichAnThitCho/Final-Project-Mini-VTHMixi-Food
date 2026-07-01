export const isWithinOperatingHours = (operatingHours?: { open: string; close: string }) => {
  if (!operatingHours || !operatingHours.open || !operatingHours.close) {
    return true;
  }

  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = operatingHours.open.split(':').map(Number);
    const [closeH, closeM] = operatingHours.close.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (closeMinutes > openMinutes) {
      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } else {
      return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    }
  } catch (err) {
    console.error('Error parsing operating hours:', err);
    return true;
  }
};
