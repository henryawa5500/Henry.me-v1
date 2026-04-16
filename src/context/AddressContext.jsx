/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AddressContext = createContext(null)
const STORAGE_KEY = 'henryme-address'

const defaultAddress = {
  fullName: '',
  phone: '',
  addressLine: '',
  city: '',
  state: '',
  notes: '',
}

const loadAddress = () => {
  if (typeof window === 'undefined') return defaultAddress
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultAddress
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaultAddress
    return { ...defaultAddress, ...parsed }
  } catch {
    return defaultAddress
  }
}

export const useAddress = () => useContext(AddressContext)

export const AddressProvider = ({ children }) => {
  const [address, setAddress] = useState(loadAddress)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(address))
  }, [address])

  const hasAddress = Boolean(
    address.addressLine || address.city || address.state || address.phone,
  )

  const saveAddress = (nextAddress) => {
    setAddress({ ...defaultAddress, ...nextAddress })
  }

  const value = useMemo(
    () => ({
      address,
      hasAddress,
      saveAddress,
    }),
    [address, hasAddress],
  )

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
}
