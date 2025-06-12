import React , {useState, useEffect} from 'react'
import Navbar from '../../components/Navbar'
import Body from './Body'
import Header from '../../components/Header'
import NewsLetterSignUp from '../../components/NewsLetterSignUp'
import Footer from '../../components/Footer'
import Navigation from './Navigation'
import { useLocation } from 'react-router-dom'
import axiosInstance from '../../utils/AxiosInstance'
const ShoppingCart = () => {
  useEffect(() => {
    // Scroll to the top when the component is mounted
    window.scrollTo(0, 0);
}, []); 
  const [isOpen, setIsOpen] = useState(false)
    useEffect(() => {
    
      return () => {
      }
    }, [isOpen])
  return (
    <>
      <Navbar/>
      <Header isOpen={isOpen} setIsOpen={setIsOpen} current={'Cart'}/>
      {!isOpen && <Navigation/>}
      {!isOpen && <Body/>}
      {!isOpen && <NewsLetterSignUp/>}
      {!isOpen && <Footer/>}
    </>
  )
}

export default ShoppingCart
