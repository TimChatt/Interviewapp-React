import React, { useState } from "react";
import { Box, Input, Button, VStack, HStack, Text } from "@chakra-ui/react";
import AiSourcingModal from "./AiSourcingModal";

const AiSourcing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({});

  return (
    <Box p={4}>
      {/* Search Input */}
      <VStack spacing={4} align="stretch">
        <HStack>
          <Input
            placeholder="Describe the candidate you are looking for..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={() => console.log("Run AI Search")}>Search</Button>
        </HStack>
        
        {/* Edit Filters Button */}
        <Button onClick={() => setIsModalOpen(true)}>Edit Filters</Button>
      </VStack>
      
      {/* AI Sourcing Filters Modal */}
      <AiSourcingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </Box>
  );
};

export default AiSourcing;
