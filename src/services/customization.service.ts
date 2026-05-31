import { prisma } from './db';

export class CustomizationService {
  /**
   * Validates if the selected customizations meet the rules defined by the schemas.
   */
  static async validateCustomizations(productId: string, selectedOptions: string[]) {
    const schemas = await prisma.customizationSchema.findMany({
      where: { productId },
      include: { options: true }
    });

    for (const schema of schemas) {
      const validOptionIds = schema.options.map(o => o.id);
      const selectedForSchema = selectedOptions.filter(id => validOptionIds.includes(id));
      
      // Basic validation rules
      if (schema.isRequired && selectedForSchema.length === 0) {
        throw new Error(`Customization ${schema.name} is required.`);
      }
      
      // You can expand this to support max limits, conditional logic, etc.
    }

    return true;
  }
}
