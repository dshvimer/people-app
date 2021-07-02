import { useEffect, useState } from 'react'
import useFetch , { Provider }from 'use-http'
import { Box, HStack, ChakraProvider, Flex, Button, VStack, Heading, Text, SkeletonCircle, SkeletonText } from "@chakra-ui/react"

type PersonProps = {
  email_address: string,
  first_name: string,
  last_name: string,
  title: string
}

const Loading = () => {
  return (
    <Box minW="sm" padding="6" boxShadow="lg" bg="white">
      <SkeletonCircle size="10" />
      <SkeletonText mt="4" noOfLines={4} spacing="4" />
    </Box>
  )
}

const Person = ({email_address, first_name, last_name, title}: PersonProps) => {
  return (
      <Box minH="10em" minW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Box m="5" as="a" href="/blog-post-thing">
          <Heading m="5" mb="0" as="h4" size="md">
            {first_name} {last_name}
          </Heading>
          <Text m="5" mt="0">{email_address}</Text>
          <Text m="5" mt="0">{title}</Text>
        </Box>
    </Box>
  )
}

const People = ({}) => {
  const [bottom, setBottom] = useState(false)
  const [page, setPage] = useState(1)

  const { data, loading } = useFetch(`/api/people?page=${page}`, {
    onNewData: (currentData, newData) => {
      return {
        data: currentData.data.concat(newData.data),
        metadata: newData.metadata
      }
    },
    perPage: 25, // stops making more requests if last todos fetched < 25
    data: {data: [], metadata: {}}
  }, [page]) // runs onMount AND whenever the `page` updates (onUpdate)

  useEffect(() => {
    if (bottom) {
      setBottom(false)
      setPage(page + 1)
    }
  }, [bottom])

  const onScroll = (event: React.UIEvent<HTMLElement>) => {
    const target = event.currentTarget

    console.log('scroll')
    if (!bottom && !loading) {
      if (target.scrollHeight - target.scrollTop < target.clientHeight + 200) {
        setBottom(true)
      }
    }
  }

  return (
     <VStack w="100%" h="100vh" overflow="scroll" onScroll={onScroll}>

      {data.data.map((person: any) => {
        return <Person key={person.id} {...person}/>
      })}

      {loading ? (
        <>
          <Loading/>
          <Loading/>
          <Loading/>
          <Loading/>
        </>
      ) : null}
    </VStack>
  )
}

function App() {
  return (
    <Provider url={process.env.REACT_APP_API_URL}>
      <ChakraProvider>

        <Box bg="none" px={4}>
          <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              <Button >Test</Button>
              <Button >Test</Button>
            </HStack>
          </Flex>
        </Box>

          <People/>
      </ChakraProvider>
    </Provider>
  )
}

export default App;
