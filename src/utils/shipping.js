const normalize = (value) => String(value || '').trim().toLowerCase()

const feeByZone = {
  lagos: 700,
  southwest: 1200,
  southsouth: 1600,
  southeast: 1700,
  northcentral: 2000,
  northwest: 2400,
  northeast: 2500,
}

const zones = {
  lagos: ['lagos'],
  southwest: ['oyo', 'ogun', 'osun', 'ondo', 'ekiti'],
  southsouth: ['rivers', 'bayelsa', 'delta', 'edo', 'akwa ibom', 'cross river'],
  southeast: ['abia', 'anambra', 'ebonyi', 'enugu', 'imo'],
  northcentral: ['abuja', 'fct', 'benue', 'kogi', 'kwara', 'nasarawa', 'niger', 'plateau'],
  northwest: ['kaduna', 'kano', 'katsina', 'kebbi', 'sokoto', 'jigawa', 'zamfara'],
  northeast: ['adamawa', 'bauchi', 'borno', 'gombe', 'taraba', 'yobe'],
}

export const calculateDeliveryFee = (address, hasItems) => {
  if (!hasItems) return 0
  const state = normalize(address?.state)
  if (!state) return feeByZone.lagos

  const zoneKey = Object.keys(zones).find((zone) =>
    zones[zone].some((entry) => entry === state),
  )

  if (!zoneKey) return feeByZone.northcentral
  return feeByZone[zoneKey] ?? feeByZone.northcentral
}
