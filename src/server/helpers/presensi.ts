export const calculateDuration = (checkin: Date, checkout: Date) => {
  const diffMs = checkout.getTime() - checkin.getTime();

  const diffHours = diffMs / (1000 * 60 * 60);

  return Math.floor(diffHours);
};

export const determineStatus = (checkin: Date, checkout: Date) => {
  const officeStart = new Date(checkin);

  officeStart.setHours(8, 0, 0, 0);

  const lateMinutes = (checkin.getTime() - officeStart.getTime()) / (1000 * 60);

  const duration = calculateDuration(checkin, checkout);

  const isHalfday = lateMinutes > 15;

  const statusTerpenuhi = duration >= 8;

  return {
    isHalfday,
    duration,
    statusTerpenuhi,
  };
};
