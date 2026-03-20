export const formatEAT = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-UG', { timeZone: 'Africa/Kampala' })
}