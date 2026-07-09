package com.reportlop.repository;

import com.reportlop.model.TabelManual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ManualRepository extends JpaRepository<TabelManual, String> {
    // Fungsi khusus untuk fitur search dan filter
    @org.springframework.data.jpa.repository.Query("SELECT t FROM TabelManual t WHERE " +
       "LOWER(COALESCE(t.lop, '')) LIKE LOWER(CONCAT('%', :search, '%')) AND " +
       "LOWER(COALESCE(t.region, '')) LIKE LOWER(CONCAT('%', :region, '%')) AND " +
       "LOWER(COALESCE(t.branch, '')) LIKE LOWER(CONCAT('%', :branch, '%')) " +
       "ORDER BY t.lop ASC")
    Page<TabelManual> findWithFilters(@org.springframework.data.repository.query.Param("search") String search, 
                                      @org.springframework.data.repository.query.Param("region") String region, 
                                      @org.springframework.data.repository.query.Param("branch") String branch, 
                                      Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM TabelManual t WHERE " +
       "LOWER(COALESCE(t.lop, '')) LIKE LOWER(CONCAT('%', :search, '%')) AND " +
       "LOWER(COALESCE(t.region, '')) LIKE LOWER(CONCAT('%', :region, '%')) AND " +
       "LOWER(COALESCE(t.branch, '')) LIKE LOWER(CONCAT('%', :branch, '%')) " +
       "ORDER BY t.lop ASC")
    java.util.List<TabelManual> findAllWithFiltersUnpaginated(
        @org.springframework.data.repository.query.Param("search") String search, 
        @org.springframework.data.repository.query.Param("region") String region, 
        @org.springframework.data.repository.query.Param("branch") String branch
    );
}