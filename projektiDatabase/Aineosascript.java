public class Aineosascript {
	
	public static void main(String[] args) {
		
	String raakalista = "paprikajauhe kinkkusuikale kermaviili";
	String[] lista = raakalista.split(" ");

	System.out.println("INSERT INTO ainesosat(nimi)\nVALUES");
	for (String x : lista) {
		System.out.println(   "('" + x + "'),"   );
	}
	System.out.println("('vesi');");

}
}
