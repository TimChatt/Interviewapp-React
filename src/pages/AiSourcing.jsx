import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { FaSlidersH, FaSearch } from "react-icons/fa";

const AISourcingTool = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSearch = () => {
    if (!searchQuery) return;
    
    // Add search to history (moving to top)
    setSearchHistory([searchQuery, ...searchHistory]);
    
    // Simulate fetching AI-optimized search results
    const results = [
      { id: 1, name: "John Doe", jobTitle: "Senior Software Engineer", company: "Google", location: "London" },
      { id: 2, name: "Jane Smith", jobTitle: "Data Scientist", company: "Meta", location: "New York" },
    ];
    
    setSearchResults(results);
    setSelectedCandidate(null);
  };

  return (
    <Box display="flex" flexDirection="column" p={6}>
      {/* Search Input Box */}
      <HStack spacing={3} mb={4}>
        <Input
          placeholder="Describe the ideal candidate (e.g. 'Senior Frontend Engineer with React experience in London')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <IconButton icon={<FaSlidersH />} onClick={onOpen} aria-label="Edit Filters" />
        <Button colorScheme="blue" leftIcon={<FaSearch />} onClick={handleSearch}>
          Search
        </Button>
      </HStack>

      {/* Search Moves to Top */}
      {searchHistory.length > 0 && (
        <Box mb={4} p={3} bg="gray.100" borderRadius="md">
          <Text fontSize="md" fontWeight="bold">Latest Search:</Text>
          <Text fontSize="sm">{searchHistory[0]}</Text>
        </Box>
      )}

      {/* Results Table */}
      <HStack spacing={6} align="flex-start">
        <Box flex={1}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Job Title</Th>
                <Th>Company</Th>
                <Th>Location</Th>
              </Tr>
            </Thead>
            <Tbody>
              {searchResults.map((candidate) => (
                <Tr key={candidate.id} onClick={() => setSelectedCandidate(candidate)}>
                  <Td>{candidate.name}</Td>
                  <Td>{candidate.jobTitle}</Td>
                  <Td>{candidate.company}</Td>
                  <Td>{candidate.location}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Candidate Profile */}
        {selectedCandidate && (
          <Box flex={0.4} p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold">{selectedCandidate.name}</Text>
            <Text>Job Title: {selectedCandidate.jobTitle}</Text>
            <Text>Company: {selectedCandidate.company}</Text>
            <Text>Location: {selectedCandidate.location}</Text>
          </Box>
        )}
      </HStack>

      {/* Filters Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Search Filters</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Filters will go here (e.g., Location, Experience, Skills, etc.)</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>Save Filters</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AISourcingTool;
