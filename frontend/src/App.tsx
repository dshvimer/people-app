import { useState, useEffect } from 'react'
import { Box, HStack, ChakraProvider, Flex, Button, VStack, Heading, Text, SkeletonCircle, SkeletonText, Modal, ModalContent, ModalOverlay, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react"

const Loading = () => {
  return (
    <Box minW="sm" padding="6" boxShadow="lg" bg="white">
      <SkeletonCircle size="10" />
      <SkeletonText mt="4" noOfLines={4} spacing="4" />
    </Box>
  )
}

const Error = () => <Heading m="5" mb="0" as="h4" size="md">There was an error</Heading>

type PersonProps = {
  email_address: string,
  first_name: string,
  last_name: string,
  title: string
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

const usePeople = () => {
  const [page, setPage] = useState('1')
  const [loading, setLoading] = useState(false)
  const [people, setPeople] = useState([])
  const [nextPage, setNextPage] = useState('2')
  const [error, setError] = useState(false)


  useEffect(() => {
    setLoading(true)
    const getPeople = async (page: string) => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/people?page=${page}`)
      if (res.status === 200) {
        const data = await res.json()
        setPeople(people.concat(data.data))
        setNextPage(data.metadata.paging.next_page)
        setLoading(false)
        setError(false)
      } else {
        setError(true)
        setLoading(false)
      }
    }
    getPeople(page)
  }, [page])

  return {people, loading, nextPage, setPage, error}
}

const People = ({}) => {
  const {people, loading, nextPage, setPage, error} = usePeople()

  if (error) return <Error/>

  return (
     <VStack py="4em">

      {people.map((person: any) => {
        return <Person key={person.id} {...person}/>
      })}

      {loading ? (
        <>
          <Loading/>
          <Loading/>
          <Loading/>
          <Loading/>
        </>
      ) : nextPage && <Button onClick={() => setPage(nextPage)}>Load more</Button>}
    </VStack>
  )
}

const useCharacterCount = () => {
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState([])
  const [error, setError] = useState(false)


  useEffect(() => {
    setLoading(true)
    const getCount = async () => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/people/chars`)
      if (res.status === 200) {
        const data = await res.json()
        setCount(data)
        setLoading(false)
        setError(false)
      } else {
        setError(true)
        setLoading(false)
      }
    }
    getCount()
  }, [])

  return {count, loading, error}
}

type CharacterStat = {
  character: string,
  count: number
}

type CharacterCountProps = {
  close: () => void
}

const CharacterCount = ({close}: CharacterCountProps) => {
  const {count, loading, error} = useCharacterCount()

  return (
    <Modal isOpen={true} onClose={close}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Character Frequency</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {error && <Text>There was an error...</Text>}

          {loading ? <Text>Loading</Text> : (
            count.map((item: CharacterStat, index: number) => <Text key={index}>{item.character}: {item.count}</Text>)
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}


function App() {
  const [showChars, setShowChars] = useState(false)
  return (
    <ChakraProvider>

        <Box w="100%" position="fixed" bg="white" px={4}>
          <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
            <HStack
              as={'nav'}
              spacing={4}>
              <Button onClick={() => setShowChars(true)}>Histogram</Button>
              <Button>Duplicates</Button>
            </HStack>
          </Flex>
        </Box>

        {showChars && <CharacterCount close={() => setShowChars(false)}/>}

        <People/>
    </ChakraProvider>
  )
}

export default App;
