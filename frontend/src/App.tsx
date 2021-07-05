import { useState, useEffect, ReactChild, PropsWithChildren } from 'react'
import { SimpleGrid, Grid, Box, HStack, ChakraProvider, Flex, Button, VStack, Heading, Text, SkeletonCircle, SkeletonText, Modal, ModalContent, ModalOverlay, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react"

type Person = {
  id: number,
  email_address: string,
  first_name: string,
  last_name: string,
  title: string
}

type CharacterStat = {
  character: string,
  count: number
}

type Duplicate = {
  duplicated_by: Person,
  possible_duplicate: Person
}

type CloseProps = {
  close: () => void
}

const useDuplicates = () => {
  const [loading, setLoading] = useState(false)
  const [dups, setDups] = useState([])
  const [error, setError] = useState(false)


  useEffect(() => {
    setLoading(true)
    const getDups = async () => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/people/duplicates`)
      if (res.status === 200) {
        const data = await res.json()
        setDups(data)
        setLoading(false)
        setError(false)
      } else {
        setError(true)
        setLoading(false)
      }
    }
    getDups()
  }, [])

  return {dups, loading, error}
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

const Skeleton = () => {
  return (
    <Box minW="sm" padding="6" boxShadow="lg" bg="white">
      <SkeletonCircle size="10" />
      <SkeletonText mt="4" noOfLines={4} spacing="4" />
    </Box>
  )
}

const Error = () => <Heading m="5" mb="0" as="h4" size="md">There was an error</Heading>

const Person = ({email_address, first_name, last_name, title}: Person) => {
  return (
      <Box minH="10em" borderWidth="1px" borderRadius="lg" overflow="hidden">
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
  const {people, loading, nextPage, setPage, error} = usePeople()

  if (error) return <Error/>

  return (
    <>
      <Grid py="4em" templateColumns="repeat(auto-fit, minmax(25em, 1fr))" gap={6}>
        {people.map((person: any) => {
          return <Person key={person.id} {...person}/>
        })}
        {loading && (
          <>
            <Skeleton/>
            <Skeleton/>
            <Skeleton/>
            <Skeleton/>
            <Skeleton/>
            <Skeleton/>
          </>
        )}
      </Grid>
      {!loading && nextPage && (
        <Button isFullWidth mb="4em" onClick={() => setPage(nextPage)}>Load more</Button>
      )}
    </>
  )
}

const CharacterCount = ({close}: CloseProps) => {
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

const Duplicates = ({close}: CloseProps) => {
  const {dups, loading, error} = useDuplicates()

  return (
    <Modal isOpen={true} onClose={close} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Duplicates</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && <Text>There was an error...</Text>}
          {loading ? <Text>Loading</Text> : (
            <HStack>
              <Text flex="1">Possible Duplicate</Text>
              <Text flex="1">Duplicated By</Text>
            </HStack>
          )}

          {dups.map((item: Duplicate, index: number) => {
            const {possible_duplicate, duplicated_by} = item
            return (
              <HStack key={index}>
                <Box flex="1">
                  <Person {...possible_duplicate} />
                </Box>
                <Box flex="1">
                <Person {...duplicated_by} />
                </Box>
              </HStack>
            )
          })}

        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const Toolbar = ({children}: PropsWithChildren<{}>) => {
  return (
    <Box w="100%" position="fixed" bg="white" px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <HStack
          as={'nav'}
          spacing={4}>
          {children}
        </HStack>
      </Flex>
    </Box>
  )
}

const App = () => {
  const [showChars, setShowChars] = useState(false)
  const [showDups, setShowDups] = useState(false)
  return (
    <ChakraProvider>
      <Toolbar>
        <Button onClick={() => setShowChars(true)}>Histogram</Button>
        <Button onClick={() => setShowDups(true)}>Duplicates</Button>
      </Toolbar>

      {showChars && <CharacterCount close={() => setShowChars(false)}/>}
      {showDups && <Duplicates close={() => setShowDups(false)}/>}

        <People/>
    </ChakraProvider>
  )
}

export default App
