import { View,  ScrollView, Text, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {images} from '../../constants'
import FormFields from '../../components/FormFields'
import CustomButton from '../../components/CustomButton'
import { Link, router } from 'expo-router'
import { createUser } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider"

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();

const [form, setForm] = useState({
  username:'',
  email: '',
  password:''
})
const [isSubmiting, setisSubmiting] = useState(false)

const submit= async ()=>{
  if(form.username === "" || form.email === ""  || form.password === "" ){
    Alert.alert('Error', 'Please fill in all the fields');
  }
setisSubmiting(true);
try{
  const result = await createUser(form.email,
    form.password, form.username)
setUser(result);
setIsLogged(true);

router.replace('/home')

} catch (error) {
  Alert.alert('Error', error.message)
} finally{
  setisSubmiting(false)
}

}

  return (
  <SafeAreaView className='bg-primary  h-full' >
<ScrollView>
  <View className='w-full justify-center min-h-[83vh] px-4 my-6' >
<Image 
source={images.logo}
resizeMode='contain' className='w-[115px] h-[35px]'/>

<Text className='text-2xl text-white text-semibold 
mt-10 font-psemibold'>Sign Up to Aora</Text>

<FormFields
title='Username'
value= {form.username}
handleChangeText={(e)=> setForm({...form, username:e})}
otherStyles="mt-10"
/>

<FormFields
title='Email'
value= {form.email}
handleChangeText={(e)=> setForm({...form, email:e})}
otherStyles="mt-7"
keyboardType='email-address'
/>
<FormFields
title='Password'
value= {form.password}
handleChangeText={(e)=> setForm({...form, password:e})}
otherStyles="mt-7"
/>
<CustomButton
title='Sign Up'
handlePress={submit}
containerStyles='mt-7'
isLoading={isSubmiting}
/>
<View className='justify-center pt-5 flex-row gap-2' >
<Text className='text-lg text-gray-100 font-pregular'>
  Have have an account already?
</Text>
<Link href='/sign-in' className='text-lg font-psemibold text-secondary '> 
Sign In
</Link>
</View>
  </View>
</ScrollView>
  </SafeAreaView>
  )
}



export default SignUp