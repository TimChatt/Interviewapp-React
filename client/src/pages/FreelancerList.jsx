// src/components/FreelancerList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  SimpleGrid,
  Box,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  List,
  ListItem,
  Link,
} from '@chakra-ui/react';

export default function FreelancerList() {
  const [freelancers, setFreelancers] = useState([]);
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    async function fetchFreelancers() {
      try {
        const { data } = await axios.get('/api/ashby/freelancers');
        setFreelancers(data);
      } catch (err) {
        console.error('Error fetching freelancers:', err);
      }
    }
    fetchFreelancers();
  }, []);

  const openModal = (freelancer) => {
    setSelected(freelancer);
    onOpen();
  };

  const closeModal = () => {
    onClose();
    setSelected(null);
  };

  return (
    <>
      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {freelancers.map((f) => (
          <Box
            key={f.id}
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            cursor="pointer"
            onClick={() => openModal(f)}
            _hover={{ shadow: 'md' }}
          >
            <Text fontWeight="bold">{f.name}</Text>
            <Text>Email: {f.email}</Text>
            <Text>Role: {f.profile?.role}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {selected && (
        <Modal isOpen={isOpen} onClose={closeModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selected.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Email: {selected.email}</Text>
              <Text>Phone: {selected.profile?.phone}</Text>

              <Box mt={4}>
                <Text fontSize="lg" mb={2} fontWeight="semibold">
                  Compliance Documents
                </Text>
                <List spacing={2} mb={4}>
                  {selected.complianceDocs?.map((doc) => (
                    <ListItem key={doc.id}>
                      <Link href={doc.url} isExternal color="blue.500">
                        {doc.name}
                      </Link>
                    </ListItem>
                  ))}
                </List>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const file = e.target.elements.doc.files[0];
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('freelancerId', selected.id);
                    try {
                      await axios.post('/api/compliance/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      // TODO: Refresh complianceDocs state
                    } catch (err) {
                      console.error('Upload error:', err);
                    }
                  }}
                >
                  <FormControl>
                    <FormLabel>Upload Document</FormLabel>
                    <Input type="file" name="doc" required />
                  </FormControl>
                  <Button mt={2} colorScheme="blue" type="submit">
                    Upload
                  </Button>
                </form>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" onClick={closeModal}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
